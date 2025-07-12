# Balancer V2 Stable Pool Deployment on Monad

This guide explains how to fork and deploy Balancer V2's stable pool contracts on Monad blockchain.

## Overview

Since Balancer vaults aren't deployed on Monad yet, you need to deploy the core contracts yourself. This guide covers the essential contracts and deployment process.

## Required Contracts

### Core Contracts (Must Deploy)
1. **Vault** (`pkg/vault/contracts/Vault.sol`) - Main orchestrator for all pool operations
2. **Authorizer** (`pkg/vault/contracts/authorizer/Authorizer.sol`) - Access control
3. **ComposableStablePool** (`pkg/pool-stable/contracts/ComposableStablePool.sol`) - Stable pool implementation
4. **ComposableStablePoolFactory** (`pkg/pool-stable/contracts/ComposableStablePoolFactory.sol`) - Factory to deploy pools
5. **ProtocolFeePercentagesProvider** (`pkg/vault/contracts/ProtocolFeesCollector.sol`) - Protocol fee management

### Dependencies (Included in build)
- **BasePool** (`pkg/pool-utils/contracts/BasePool.sol`)
- **BaseGeneralPool** (`pkg/pool-utils/contracts/BaseGeneralPool.sol`)
- **StableMath** (`pkg/pool-stable/contracts/StableMath.sol`)
- All interfaces from `pkg/interfaces/contracts/`

## Deployment Steps

### Step 1: Fork and Setup
```bash
# Fork the repository to your GitHub account
git clone --recurse-submodules https://github.com/YOUR_USERNAME/balancer-v2-monorepo.git
cd balancer-v2-monorepo

# Install dependencies
yarn install

# Build balancer-js first (required)
yarn workspace @balancer-labs/balancer-js build

# Build all contracts
yarn build
```

### Step 2: Configure Hardhat for Monad
Create or modify `hardhat.config.ts`:

```typescript
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

### Step 3: Deploy Core Contracts

Run the deployment script:
```bash
npx hardhat run scripts/monad-deployment/deploy-stable-pool.ts --network monad
```

This will deploy:
1. Authorizer
2. WETH (or use existing)
3. Vault
4. ProtocolFeePercentagesProvider
5. ComposableStablePoolFactory

### Step 4: Create Stable Pool

After deployment, use the create pool script:
```bash
npx hardhat run scripts/monad-deployment/create-stable-pool.ts --network monad
```

## Key Differences from Berachain (Burbear Example)

### 1. Network Configuration
- Monad uses different RPC endpoints and chain ID
- Gas optimization for Monad's parallel execution
- Different token addresses for stablecoins

### 2. Contract Modifications
You may need to modify contracts for Monad compatibility:

```solidity
// Example: Modify gas optimization for Monad
contract ComposableStablePool {
    // Add Monad-specific optimizations
    function _optimizeForMonad() internal pure {
        // Monad-specific gas optimizations
    }
}
```

### 3. Token Integration
Replace token addresses with Monad equivalents:
```typescript
const MONAD_TOKENS = {
  USDC: '0x...', // Monad USDC address
  USDT: '0x...', // Monad USDT address
  DAI: '0x...',  // Monad DAI address
};
```

## Pool Parameters

### Stable Pool Configuration
```typescript
const poolConfig = {
  amplificationParameter: 100,        // A parameter for stable math
  swapFeePercentage: '0.003',        // 0.3% swap fee
  tokens: [USDC, USDT, DAI],         // 3-token stable pool
  rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS], // No rate providers
  tokenRateCacheDurations: [0, 0, 0], // No caching
  exemptFromYieldProtocolFeeFlags: [false, false, false],
};
```

## Testing Your Deployment

### 1. Verify Contracts
```bash
npx hardhat verify --network monad VAULT_ADDRESS "AUTHORIZER_ADDRESS" "WETH_ADDRESS" 0 0
```

### 2. Test Pool Operations
Create test scripts for:
- Joining the pool
- Swapping tokens
- Exiting the pool

## Common Issues and Solutions

### 1. Gas Limit Issues
Monad may have different gas limits. Adjust in deployment:
```typescript
const tx = await contract.deploy({
  gasLimit: 5000000, // Adjust for Monad
});
```

### 2. Token Approval Issues
Ensure tokens are approved for the Vault:
```typescript
await token.approve(vault.address, ethers.constants.MaxUint256);
```

### 3. Pool Initialization
Stable pools need proper initialization:
```typescript
const initialBalances = [fp(1000), fp(1000), fp(1000)]; // Equal initial liquidity
```

## Security Considerations

1. **Audit**: Consider auditing your fork before mainnet deployment
2. **Access Control**: Properly configure Authorizer permissions
3. **Emergency Pause**: Test pause/unpause functionality
4. **Recovery Mode**: Understand recovery mode mechanics

## Next Steps

1. Deploy to Monad testnet first
2. Test all pool operations thoroughly
3. Deploy to Monad mainnet
4. Set up monitoring and alerts
5. Consider governance mechanisms

## Resources

- [Balancer V2 Documentation](https://docs.balancer.fi/)
- [Monad Documentation](https://docs.monad.xyz/)
- [Burbear Berachain Example](https://docs.burrbear.io/product-overview/contract-addresses)

## Support

For issues specific to Balancer contracts, refer to the original Balancer documentation. For Monad-specific issues, consult Monad's developer resources. 