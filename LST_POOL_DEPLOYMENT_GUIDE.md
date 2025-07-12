# Complete Guide: Multi-Token AMM Pool for LST on Monad

## Overview

This guide walks you through deploying a Balancer V2 weighted pool specifically designed for Liquid Staking Tokens (LST) on Monad blockchain. Since Balancer's core contracts aren't deployed on Monad yet, we'll deploy them ourselves.

## Why Weighted Pool for LST?

**Weighted pools are ideal for LST tokens because:**

1. **Different Underlying Assets**: LST tokens represent different underlying assets (ETH, SOL, etc.)
2. **Varying Yields**: Each LST has different yield rates and risk profiles
3. **Flexible Weights**: You can adjust token weights based on market cap, liquidity, or strategy
4. **Rate Providers**: Track yield accumulation for protocol fee calculations

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SimpleAuthorizer │    │      Vault      │    │ WeightedPoolFactory │
│   (Access Control) │    │  (Core Logic)   │    │  (Pool Creation)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  WeightedPool   │
                    │  (Your LST Pool) │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Rate Providers  │
                    │ (Yield Tracking) │
                    └─────────────────┘
```

## Phase 1: Setup and Dependencies

### Prerequisites

1. **Fork the Repository**
```bash
git clone --recurse-submodules https://github.com/YOUR_USERNAME/balancer-v2-monorepo.git
cd balancer-v2-monorepo
```

2. **Install Dependencies**
```bash
yarn install
yarn workspace @balancer-labs/balancer-js build
yarn build
```

3. **Configure Hardhat for Monad**
```typescript
// hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.7.1',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monad: {
      url: 'YOUR_MONAD_RPC_URL',
      accounts: ['YOUR_PRIVATE_KEY'],
      chainId: YOUR_MONAD_CHAIN_ID,
    },
  },
};

export default config;
```

## Phase 2: Deploy Core Contracts

### Step 1: Deploy Core Infrastructure

```bash
npx hardhat run scripts/monad-deployment/deploy-weighted-pool.ts --network monad
```

This deploys:
- **SimpleAuthorizer**: Access control
- **Vault**: Core orchestrator
- **ProtocolFeePercentagesProvider**: Fee management
- **WeightedPoolFactory**: Pool creation

### Step 2: Deploy Rate Providers

```bash
npx hardhat run scripts/monad-deployment/deploy-lst-rate-providers.ts --network monad
```

This deploys rate providers for each LST token to track yield accumulation.

## Phase 3: Configure LST Tokens

### LST Token Considerations

**Common LST Tokens:**
- **stETH** (Lido): `getTotalPooledEther() / totalSupply()`
- **rETH** (Rocket Pool): `getExchangeRate()`
- **cbETH** (Coinbase): `getExchangeRate()`
- **wstETH** (Lido Wrapped): `stETH.getRate()`

### Rate Provider Implementation

Each LST token needs a custom rate provider:

```solidity
// Example for stETH
contract StETHRateProvider is LSTRateProvider {
    function _getUnderlyingBalance() internal view override returns (uint256) {
        return IStETH(address(lstToken)).getTotalPooledEther();
    }
}

// Example for rETH
contract RETHRateProvider is LSTRateProvider {
    function _getUnderlyingBalance() internal view override returns (uint256) {
        return lstToken.totalSupply().mulDown(IRETH(address(lstToken)).getExchangeRate());
    }
}
```

## Phase 4: Create Your LST Pool

### Step 1: Update Configuration

Edit `scripts/monad-deployment/create-weighted-pool.ts`:

```typescript
const MONAD_LST_TOKENS = {
  stETH: '0x...', // Your Monad stETH address
  rETH: '0x...',  // Your Monad rETH address
  cbETH: '0x...', // Your Monad cbETH address
};

const rateProviders = [
  '0x...', // Your stETH rate provider
  '0x...', // Your rETH rate provider
  '0x...', // Your cbETH rate provider
];
```

### Step 2: Create the Pool

```bash
npx hardhat run scripts/monad-deployment/create-weighted-pool.ts --network monad
```

## Phase 5: Pool Configuration

### Weight Distribution Strategies

**Option 1: Equal Weights (33.33% each)**
```typescript
const normalizedWeights = [
  ethers.utils.parseEther('0.333'), // 33.3%
  ethers.utils.parseEther('0.333'), // 33.3%
  ethers.utils.parseEther('0.334'), // 33.4% (to sum to 1)
];
```

**Option 2: Market Cap Weighted**
```typescript
const normalizedWeights = [
  ethers.utils.parseEther('0.50'), // 50% for largest LST
  ethers.utils.parseEther('0.30'), // 30% for medium LST
  ethers.utils.parseEther('0.20'), // 20% for smaller LST
];
```

**Option 3: Yield-Optimized**
```typescript
const normalizedWeights = [
  ethers.utils.parseEther('0.40'), // Higher weight for higher yield
  ethers.utils.parseEther('0.35'), // Medium yield
  ethers.utils.parseEther('0.25'), // Lower yield
];
```

### Fee Structure

**Recommended Fees for LST Pools:**
- **Swap Fee**: 0.1% - 0.3% (lower than stable pools)
- **Protocol Fee**: 0.1% - 0.2%
- **Yield Fee**: 0.1% - 0.5% (on yield accumulation)

## Phase 6: Testing and Validation

### Test Pool Operations

1. **Join Pool**
```typescript
// Add initial liquidity
const joinRequest = {
  assets: [stETH, rETH, cbETH],
  maxAmountsIn: [amount1, amount2, amount3],
  userData: ethers.utils.defaultAbiCoder.encode(
    ['uint256', 'uint256[]'],
    [0, [amount1, amount2, amount3]] // INIT join
  ),
  fromInternalBalance: false,
};

await vault.joinPool(poolId, sender, recipient, joinRequest);
```

2. **Swap Tokens**
```typescript
const swapRequest = {
  kind: 0, // GIVEN_IN
  tokenIn: stETH,
  tokenOut: rETH,
  amount: amountIn,
  userData: '0x',
  fromInternalBalance: false,
  toInternalBalance: false,
};

await vault.swap(swapRequest, funds, limit, deadline);
```

3. **Exit Pool**
```typescript
const exitRequest = {
  assets: [stETH, rETH, cbETH],
  minAmountsOut: [min1, min2, min3],
  userData: ethers.utils.defaultAbiCoder.encode(
    ['uint256', 'uint256'],
    [1, bptAmountIn] // EXACT_TOKENS_IN_FOR_BPT_OUT
  ),
  toInternalBalance: false,
};

await vault.exitPool(poolId, sender, recipient, exitRequest);
```

## Phase 7: Advanced Features

### 1. Dynamic Weight Adjustment

For managed pools, you can adjust weights over time:

```typescript
// Gradually change weights over 7 days
await pool.updateWeightsGradually(
  startTime,
  endTime,
  newWeights
);
```

### 2. Circuit Breakers

Implement circuit breakers for extreme market conditions:

```solidity
// In your pool contract
function _checkCircuitBreakers() internal view {
  // Check for extreme price movements
  // Pause trading if necessary
}
```

### 3. Yield Optimization

Track and optimize for the highest yielding LST:

```typescript
// Monitor rates and rebalance
const rates = await Promise.all(
  rateProviders.map(rp => rp.getRate())
);
// Rebalance to highest yielding LST
```

## Phase 8: Security Considerations

### 1. Access Control
- **Authorizer**: Only allow trusted addresses to perform admin functions
- **Timelock**: Implement delays for critical operations
- **Multi-sig**: Use multi-signature wallets for governance

### 2. Rate Provider Security
- **Oracle Integration**: Use reliable oracles for rate data
- **Circuit Breakers**: Implement emergency stops
- **Rate Limits**: Prevent extreme rate changes

### 3. Pool Security
- **Recovery Mode**: Enable for emergency situations
- **Pause Functionality**: Ability to pause trading
- **Fee Caps**: Maximum fee limits

## Phase 9: Monitoring and Maintenance

### 1. Key Metrics to Monitor
- **Pool TVL**: Total Value Locked
- **Swap Volume**: Trading activity
- **Yield Accumulation**: Rate changes over time
- **Impermanent Loss**: LP position tracking
- **Gas Costs**: Transaction efficiency

### 2. Alerts and Notifications
```typescript
// Monitor rate changes
const rateChange = (newRate - oldRate) / oldRate;
if (rateChange > 0.05) { // 5% change
  // Send alert
}
```

### 3. Regular Maintenance
- **Weight Rebalancing**: Monthly weight adjustments
- **Fee Optimization**: Adjust fees based on volume
- **Security Updates**: Regular contract upgrades

## Phase 10: Governance and Upgrades

### 1. Governance Structure
```solidity
contract LSTPoolGovernance {
    address public governance;
    uint256 public proposalDelay;
    
    modifier onlyGovernance() {
        require(msg.sender == governance, "Not governance");
        _;
    }
}
```

### 2. Upgrade Mechanisms
- **Proxy Pattern**: Use upgradeable proxies
- **Timelock**: Implement delays for upgrades
- **Multi-sig**: Require multiple signatures

## Common Issues and Solutions

### 1. Gas Optimization
**Problem**: High gas costs on Monad
**Solution**: 
- Use batch operations
- Optimize rate provider calls
- Implement gas-efficient math

### 2. Rate Provider Failures
**Problem**: Rate provider returns incorrect data
**Solution**:
- Implement fallback oracles
- Add circuit breakers
- Use multiple data sources

### 3. Impermanent Loss
**Problem**: LPs lose value due to price changes
**Solution**:
- Educate LPs about risks
- Provide yield farming incentives
- Consider dynamic fee structures

## Next Steps

1. **Deploy to Testnet**: Test thoroughly on Monad testnet
2. **Security Audit**: Get professional audit before mainnet
3. **Community Launch**: Gradual rollout with community feedback
4. **Monitoring Setup**: Implement comprehensive monitoring
5. **Governance**: Set up DAO or governance structure

## Resources

- [Balancer V2 Documentation](https://docs.balancer.fi/)
- [Monad Documentation](https://docs.monad.xyz/)
- [LST Token Standards](https://ethereum.org/en/staking/liquid-staking/)
- [Rate Provider Examples](https://github.com/balancer-labs/balancer-v2-monorepo/tree/master/pkg/pool-weighted/contracts)

## Support

For technical issues:
- Balancer Discord: [https://discord.gg/balancer](https://discord.gg/balancer)
- Monad Discord: [https://discord.gg/monad](https://discord.gg/monad)
- GitHub Issues: [https://github.com/balancer-labs/balancer-v2-monorepo/issues](https://github.com/balancer-labs/balancer-v2-monorepo/issues) 