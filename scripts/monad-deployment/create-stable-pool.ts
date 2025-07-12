/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Creating stable pool with account:', deployer.address);

  // Replace these with your deployed contract addresses from deploy-stable-pool.ts
  const FACTORY_ADDRESS = '0x...'; // Your deployed ComposableStablePoolFactory address
  const VAULT_ADDRESS = '0x...';   // Your deployed Vault address

  // Example Monad token addresses (replace with actual addresses)
  const MONAD_TOKENS = {
    USDC: '0x...', // Replace with actual Monad USDC address
    USDT: '0x...', // Replace with actual Monad USDT address
    DAI: '0x...',  // Replace with actual Monad DAI address
  };

  try {
    const factory = await ethers.getContractAt('ComposableStablePoolFactory', FACTORY_ADDRESS);
    const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS);

    // Pool configuration
    const tokens = [
      MONAD_TOKENS.USDC,
      MONAD_TOKENS.USDT,
      MONAD_TOKENS.DAI,
    ];

    // Rate providers (can be zero address if no rate provider needed)
    const rateProviders = [
      '0x0000000000000000000000000000000000000000', // No rate provider for USDC
      '0x0000000000000000000000000000000000000000', // No rate provider for USDT
      '0x0000000000000000000000000000000000000000', // No rate provider for DAI
    ];

    // Rate cache durations (in seconds)
    const tokenRateCacheDurations = [
      0, // No cache for USDC
      0, // No cache for USDT
      0, // No cache for DAI
    ];

    // Exempt from yield protocol fee flags
    const exemptFromYieldProtocolFeeFlags = [false, false, false];

    // Pool parameters
    const amplificationParameter = 100; // Amplification parameter (A)
    const swapFeePercentage = ethers.utils.parseEther('0.003'); // 0.3% swap fee
    const owner = deployer.address;

    console.log('Creating stable pool with parameters:');
    console.log('Tokens:', tokens);
    console.log('Amplification Parameter:', amplificationParameter);
    console.log('Swap Fee Percentage:', ethers.utils.formatEther(swapFeePercentage));
    console.log('Owner:', owner);

    // Create the pool
    console.log('\n=== Creating Stable Pool ===');
    const tx = await factory.create(
      'Balancer Stable Pool', // name
      'BSP', // symbol
      tokens,
      amplificationParameter,
      rateProviders,
      tokenRateCacheDurations,
      exemptFromYieldProtocolFeeFlags,
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
      console.log('🎉 Stable pool created at:', poolAddress);
      
      // Get pool ID
      const pool = await ethers.getContractAt('ComposableStablePool', poolAddress);
      const poolId = await pool.getPoolId();
      console.log('Pool ID:', poolId);

      console.log('\n📝 Pool Information:');
      console.log('Pool Address:', poolAddress);
      console.log('Pool ID:', poolId);
      console.log('Factory:', FACTORY_ADDRESS);
      console.log('Vault:', VAULT_ADDRESS);

      console.log('\n🚀 Next steps:');
      console.log('1. Add initial liquidity to the pool');
      console.log('2. Test swaps between tokens');
      console.log('3. Set up monitoring and alerts');
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