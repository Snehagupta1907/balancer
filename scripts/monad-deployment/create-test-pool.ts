/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Creating test stable pool with mock tokens');
  console.log('Account:', deployer.address);

  // Deployed addresses from deploy-core-only.ts
  const FACTORY_ADDRESS = '0x584A90E3d3Fd90962C00d05C8f37300E9b4D97B3'; // ComposableStablePoolFactory
  const VAULT_ADDRESS = '0x598265DC45aDA61227153a96A3d20Ea0Fa198B0E';   // Vault

  // Mock token addresses from deploy-core-only.ts
  const MOCK_TOKENS = {
    shMON: '0x747ee810C8477F2e85A88ea66A5e03C9494A2cfc', // Mock shMON
    sMON: '0xeAB8785e3D2E48E5b24689D7e98c88f91Fd8170D',  // Mock sMON
    gMON: '0xE04fa707fAcAF0441E5983aCDCB89FfCC457234b',  // Mock gMON
    aprMON: '0x75714FE9Fc17a84097e6194b3B024716AD5a2bE7', // Mock aprMON
  };

  try {
    console.log('\n=== Creating Test Stable Pool ===');

    // Get the factory contract
    const factory = await ethers.getContractAt('ComposableStablePoolFactory', FACTORY_ADDRESS);

    // Test pool configuration (NO rate providers for testing)
    const poolConfig = {
      name: 'Test LST Pool',
      symbol: 'TESTLST',
      tokens: [
        MOCK_TOKENS.shMON,
        MOCK_TOKENS.sMON,
        MOCK_TOKENS.gMON,
        MOCK_TOKENS.aprMON,
      ],
      rateProviders: [
        ethers.constants.AddressZero, // No rate provider for shMON
        ethers.constants.AddressZero, // No rate provider for sMON
        ethers.constants.AddressZero, // No rate provider for gMON
        ethers.constants.AddressZero, // No rate provider for aprMON
      ],
      tokenRateCacheDurations: [
        0, // No cache for shMON
        0, // No cache for sMON
        0, // No cache for gMON
        0, // No cache for aprMON
      ],
      exemptFromYieldProtocolFeeFlags: [
        true, // shMON exempt from yield fees (no rate provider)
        true, // sMON exempt from yield fees (no rate provider)
        true, // gMON exempt from yield fees (no rate provider)
        true, // aprMON exempt from yield fees (no rate provider)
      ],
      swapFeePercentage: 100, // 0.1% - low fee for testing
      amplificationParameter: 200, // Balanced amplification
      owner: deployer.address,
    };

    console.log('Test pool configuration:');
    console.log('- Name:', poolConfig.name);
    console.log('- Symbol:', poolConfig.symbol);
    console.log('- Tokens:', poolConfig.tokens);
    console.log('- Rate Providers: NONE (for testing)');
    console.log('- Swap Fee:', poolConfig.swapFeePercentage / 10000, '%');
    console.log('- Amplification:', poolConfig.amplificationParameter);

    // Create the test pool
    console.log('\nCreating test pool...');
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
    console.log('✅ Test pool created successfully!');

    // Get the pool address from the event
    const poolAddress = receipt.events?.find((e: any) => e.event === 'PoolCreated')?.args?.pool;
    console.log('Pool address:', poolAddress);

    console.log('\n🎉 === TEST POOL CREATION SUCCESSFUL === 🎉');
    console.log('✅ Test LST Stable Pool created');
    console.log('✅ Pool address:', poolAddress);
    console.log('✅ 4 mock LST tokens (no rate providers)');
    console.log('✅ Ready for testing swaps');

    console.log('\n📝 Next Steps:');
    console.log('1. Mint some mock tokens to test with');
    console.log('2. Add initial liquidity to the pool');
    console.log('3. Test swaps between mock tokens');
    console.log('4. If everything works, deploy real LST tokens and rate providers');

  } catch (error) {
    console.error('❌ Test pool creation failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 