# Monad Deployment Scripts

This directory contains scripts to deploy Balancer V2 stable pool contracts on Monad blockchain.

## Files

- `deploy-stable-pool.ts` - Deploys core contracts (Vault, Authorizer, Factory, etc.)
- `create-stable-pool.ts` - Creates a stable pool using the deployed factory
- `config.ts` - Configuration file for addresses and settings

## Prerequisites

1. **Fork the Balancer repo** to your GitHub account
2. **Install dependencies**: `yarn install`
3. **Build contracts**: `yarn build`
4. **Configure Hardhat** for Monad network

## Setup

### 1. Configure Hardhat

Update `hardhat.config.ts` to include Monad network:

```typescript
networks: {
  monad: {
    url: 'YOUR_MONAD_RPC_URL',
    accounts: ['YOUR_PRIVATE_KEY'],
    chainId: YOUR_MONAD_CHAIN_ID,
  },
}
```

### 2. Update Configuration

Edit `config.ts` with your Monad-specific settings:

```typescript
export const MONAD_CONFIG = {
  CHAIN_ID: 1337, // Replace with actual Monad chain ID
  RPC_URL: 'https://rpc.monad.xyz', // Replace with actual RPC URL
  
  TOKENS: {
    WETH: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
    USDC: '0x...', // Replace with actual Monad USDC address
    USDT: '0x...', // Replace with actual Monad USDT address
    DAI: '0x...',  // Replace with actual Monad DAI address
  },
}
```

## Deployment Steps

### Step 1: Deploy Core Contracts

```bash
npx hardhat run scripts/monad-deployment/deploy-stable-pool.ts --network monad
```

This will deploy:
- Authorizer
- Vault
- ProtocolFeePercentagesProvider
- ComposableStablePoolFactory

### Step 2: Update Configuration

After deployment, update `config.ts` with the deployed addresses:

```typescript
export const DEPLOYMENT_ADDRESSES = {
  AUTHORIZER: '0x...', // From deployment output
  VAULT: '0x...',      // From deployment output
  PROTOCOL_FEE_PROVIDER: '0x...', // From deployment output
  STABLE_POOL_FACTORY: '0x...',   // From deployment output
};
```

### Step 3: Create Stable Pool

```bash
npx hardhat run scripts/monad-deployment/create-stable-pool.ts --network monad
```

## Configuration Options

### Pool Parameters

You can modify pool parameters in `config.ts`:

```typescript
POOL_CONFIG: {
  AMPLIFICATION_PARAMETER: 100,    // A parameter for stable math
  SWAP_FEE_PERCENTAGE: '0.003',    // 0.3% swap fee
  POOL_NAME: 'Balancer Stable Pool',
  POOL_SYMBOL: 'BSP',
}
```

### Gas Settings

Adjust gas limits for Monad:

```typescript
GAS_SETTINGS: {
  AUTHORIZER_GAS_LIMIT: 2000000,
  VAULT_GAS_LIMIT: 5000000,
  FACTORY_GAS_LIMIT: 3000000,
  POOL_CREATION_GAS_LIMIT: 4000000,
}
```

## Troubleshooting

### Common Issues

1. **Gas Limit Errors**: Increase gas limits in `config.ts`
2. **Token Address Errors**: Verify token addresses exist on Monad
3. **Permission Errors**: Check Authorizer permissions

### Debug Commands

```bash
# Check account balance
npx hardhat run -e "console.log(await ethers.provider.getBalance(await ethers.getSigner().getAddress()))" --network monad

# Verify contract deployment
npx hardhat verify --network monad CONTRACT_ADDRESS CONSTRUCTOR_ARGS
```

## Next Steps

After successful deployment:

1. **Test pool operations** (joins, swaps, exits)
2. **Add initial liquidity**
3. **Set up monitoring**
4. **Deploy to mainnet**

## Security Notes

- Test thoroughly on testnet first
- Verify all contract addresses
- Check permissions and access controls
- Consider auditing before mainnet deployment 