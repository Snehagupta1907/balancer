/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Creating weighted pool for LST tokens with account:', deployer.address);

  // Replace these with your deployed contract addresses from deploy-weighted-pool.ts
  const FACTORY_ADDRESS = '0x...'; // Your deployed WeightedPoolFactory address
  const VAULT_ADDRESS = '0x...';   // Your deployed Vault address

  // Example Monad LST token addresses (replace with actual addresses)
  const MONAD_LST_TOKENS = {
    // Example LST tokens - replace with actual Monad addresses
    stETH: '0x...', // Monad stETH address
    rETH: '0x...',  // Monad rETH address  
    cbETH: '0x...', // Monad cbETH address
    // Add more LST tokens as needed
  };

  try {
    const factory = await ethers.getContractAt('WeightedPoolFactory', FACTORY_ADDRESS);
    const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS);

    // Pool configuration for LST tokens
    const tokens = [
      MONAD_LST_TOKENS.stETH,
      MONAD_LST_TOKENS.rETH,
      MONAD_LST_TOKENS.cbETH,
    ];

    // Rate providers for LST tokens (you'll need to deploy these)
    const rateProviders = [
      '0x...', // Rate provider for stETH
      '0x...', // Rate provider for rETH  
      '0x...', // Rate provider for cbETH
    ];

    // Normalized weights (must sum to 1e18)
    // For LST tokens, you might want equal weights or weights based on market cap
    const normalizedWeights = [
      ethers.utils.parseEther('0.333'), // 33.3% for stETH
      ethers.utils.parseEther('0.333'), // 33.3% for rETH
      ethers.utils.parseEther('0.334'), // 33.4% for cbETH (to sum to 1)
    ];

    // Pool parameters
    const swapFeePercentage = ethers.utils.parseEther('0.003'); // 0.3% swap fee
    const owner = deployer.address;

    console.log('Creating weighted pool for LST tokens with parameters:');
    console.log('Tokens:', tokens);
    console.log('Rate Providers:', rateProviders);
    console.log('Normalized Weights:', normalizedWeights.map(w => ethers.utils.formatEther(w)));
    console.log('Swap Fee Percentage:', ethers.utils.formatEther(swapFeePercentage));
    console.log('Owner:', owner);

    // Create the pool
    console.log('\n=== Creating Weighted Pool for LST ===');
    const tx = await factory.create(
      'Balancer LST Pool', // name
      'BLST', // symbol
      tokens,
      normalizedWeights,
      rateProviders,
      swapFeePercentage,
      owner,
      ethers.utils.randomBytes(32) // salt
    );

    console.log('Pool creation transaction submitted:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Pool creation transaction confirmed');

    // Find the pool address from events
    const poolCreatedEvent = receipt.events?.find(
      (event: any) => event.event === 'PoolCreated'
    );
    
    if (poolCreatedEvent) {
      const poolAddress = poolCreatedEvent.args?.pool;
      console.log('🎉 Weighted LST pool created at:', poolAddress);
      
      // Get pool ID
      const pool = await ethers.getContractAt('WeightedPool', poolAddress);
      const poolId = await pool.getPoolId();
      console.log('Pool ID:', poolId);

      console.log('\n📝 Pool Information:');
      console.log('Pool Address:', poolAddress);
      console.log('Pool ID:', poolId);
      console.log('Factory:', FACTORY_ADDRESS);
      console.log('Vault:', VAULT_ADDRESS);

      console.log('\n🚀 Next steps:');
      console.log('1. Deploy rate providers for each LST token');
      console.log('2. Add initial liquidity to the pool');
      console.log('3. Test swaps between LST tokens');
      console.log('4. Set up monitoring and alerts');
      console.log('5. Consider governance mechanisms');
    } else {
      console.log('⚠️ PoolCreated event not found in transaction receipt');
    }

  } catch (error) {
    console.error('❌ Pool creation failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 