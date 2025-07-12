/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Creating LST stable pool with account:', deployer.address);

  // Replace these with your deployed contract addresses from deploy-stable-pool.ts
  const FACTORY_ADDRESS = '0x...'; // Your deployed ComposableStablePoolFactory address
  const VAULT_ADDRESS = '0x...';   // Your deployed Vault address

  // Example Monad LST token addresses (replace with actual addresses)
  const LST_TOKENS = {
    shMON: '0x3a98250F98Dd388C211206983453837C8365BDc1', // shMON address
    sMON: '0xe1d2439b75fb9746E7Bc6cB777Ae10AA7f7ef9c5',  // sMON address  
    gMON: '0xaEef2f6B429Cb59C9B2D7bB2141ADa993E8571c3',  // gMON address
    aprMON: '0xb2f82D0f38dc453D596Ad40A37799446Cc89274A', // aprMON address
  };

  // Rate providers for LST tokens (deploy these first)
  const RATE_PROVIDERS = {
    shMON: '0x...', // shMON rate provider
    sMON: '0x...',  // sMON rate provider
    gMON: '0x...',  // gMON rate provider
    aprMON: '0x...', // aprMON rate provider
  };

  try {
    console.log('\n=== Creating LST Stable Pool ===');

    // Get the factory contract
    const factory = await ethers.getContractAt('ComposableStablePoolFactory', FACTORY_ADDRESS);

    // Pool configuration for LST tokens
    const poolConfig = {
      name: 'LST Stable Pool',
      symbol: 'LSTSP',
      tokens: [
        LST_TOKENS.shMON,
        LST_TOKENS.sMON,
        LST_TOKENS.gMON,
        LST_TOKENS.aprMON,
      ],
      rateProviders: [
        RATE_PROVIDERS.shMON,
        RATE_PROVIDERS.sMON,
        RATE_PROVIDERS.gMON,
        RATE_PROVIDERS.aprMON,
      ],
      tokenRateCacheDurations: [
        300, // 5 minutes for shMON
        300, // 5 minutes for sMON
        300, // 5 minutes for gMON
        300, // 5 minutes for aprMON
      ],
      exemptFromYieldProtocolFeeFlags: [
        false, // shMON pays yield fees
        false, // sMON pays yield fees
        false, // gMON pays yield fees
        false, // aprMON pays yield fees
      ],
      swapFeePercentage: 100, // 0.1% - low fee for stable assets
      amplificationParameter: 200, // Amplification parameter (100-500 recommended)
      owner: deployer.address,
    };

    console.log('Pool configuration:');
    console.log('- Name:', poolConfig.name);
    console.log('- Symbol:', poolConfig.symbol);
    console.log('- Tokens:', poolConfig.tokens);
    console.log('- Rate Providers:', poolConfig.rateProviders);
    console.log('- Swap Fee:', poolConfig.swapFeePercentage / 10000, '%');
    console.log('- Amplification:', poolConfig.amplificationParameter);

    // Create the pool
    console.log('\nCreating pool...');
    const tx = await factory.create(
      poolConfig.name,
      poolConfig.symbol,
      poolConfig.tokens,
      poolConfig.amplificationParameter,
      poolConfig.rateProviders,
      poolConfig.tokenRateCacheDurations,
      poolConfig.exemptFromYieldProtocolFeeFlags,
      poolConfig.swapFeePercentage,
      poolConfig.owner
    );

    console.log('Transaction hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('Pool created successfully!');

    // Get the pool address from the event
    const poolAddress = receipt.events?.find((e: { event: string; }) => e.event === 'PoolCreated')?.args?.pool;
    console.log('Pool address:', poolAddress);

    console.log('\n=== Pool Creation Summary ===');
    console.log('✅ LST Stable Pool created successfully');
    console.log('✅ Pool address:', poolAddress);
    console.log('✅ 4 LST tokens: shMON, sMON, gMON, aprMON');
    console.log('✅ Low slippage for similar-priced LST tokens');
    console.log('✅ Rate providers for yield tracking');

    console.log('\n=== Next Steps ===');
    console.log('1. Add initial liquidity to the pool');
    console.log('2. Test swaps between LST tokens');
    console.log('3. Monitor pool performance');
    console.log('4. Adjust amplification parameter if needed');

  } catch (error) {
    console.error('Pool creation failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 