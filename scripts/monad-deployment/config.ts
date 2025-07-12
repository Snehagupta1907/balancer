/* eslint-disable prettier/prettier */

// Monad Network Configuration
export const MONAD_CONFIG = {
  // Replace with actual Monad network details
  CHAIN_ID: 1337, // Replace with actual Monad chain ID
  RPC_URL: 'https://rpc.monad.xyz', // Replace with actual RPC URL
  
  // Monad token addresses (replace with actual addresses)
  TOKENS: {
    WETH: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
    USDC: '0x...', // Replace with actual Monad USDC address
    USDT: '0x...', // Replace with actual Monad USDT address
    DAI: '0x...',  // Replace with actual Monad DAI address
  },
  
  // Pool configuration
  POOL_CONFIG: {
    AMPLIFICATION_PARAMETER: 100,
    SWAP_FEE_PERCENTAGE: '0.003', // 0.3%
    POOL_NAME: 'Balancer Stable Pool',
    POOL_SYMBOL: 'BSP',
  },
  
  // Gas settings for Monad
  GAS_SETTINGS: {
    AUTHORIZER_GAS_LIMIT: 2000000,
    VAULT_GAS_LIMIT: 5000000,
    FACTORY_GAS_LIMIT: 3000000,
    POOL_CREATION_GAS_LIMIT: 4000000,
  },
};

// Deployment addresses (update after deployment)
export const DEPLOYMENT_ADDRESSES = {
  AUTHORIZER: '0x...', // Update after deployment
  VAULT: '0x...',      // Update after deployment
  PROTOCOL_FEE_PROVIDER: '0x...', // Update after deployment
  STABLE_POOL_FACTORY: '0x...',   // Update after deployment
};

// Helper function to validate addresses
export function validateAddresses() {
  const addresses = Object.values(DEPLOYMENT_ADDRESSES);
  const invalidAddresses = addresses.filter(addr => addr === '0x...');
  
  if (invalidAddresses.length > 0) {
    console.warn('⚠️ Some deployment addresses are not set. Please update config.ts');
    return false;
  }
  
  return true;
}

// Helper function to get token addresses
export function getTokenAddresses() {
  return [
    MONAD_CONFIG.TOKENS.USDC,
    MONAD_CONFIG.TOKENS.USDT,
    MONAD_CONFIG.TOKENS.DAI,
  ];
} 