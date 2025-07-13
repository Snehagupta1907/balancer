/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Creating test pool without rate providers');
  console.log('Account:', deployer.address);

  // Deployed addresses from deploy-core-only.ts
  const FACTORY_ADDRESS = '0x584A90E3d3Fd90962C00d05C8f37300E9b4D97B3';
  const VAULT_ADDRESS = '0x598265DC45aDA61227153a96A3d20Ea0Fa198B0E';

  // Mock token addresses from deploy-core-only.ts
  const MOCK_TOKENS = {
    shMON: '0x747ee810C8477F2e85A88ea66A5e03C9494A2cfc',
    sMON: '0xeAB8785e3D2E48E5b24689D7e98c88f91Fd8170D',
    gMON: '0xE04fa707fAcAF0441E5983aCDCB89FfCC457234b',
    aprMON: '0x75714FE9Fc17a84097e6194b3B024716AD5a2bE7',
  };

  try {
    console.log('\n=== Creating Test Pool Without Rate Providers ===');

    // Get factory contract
    const factory = await ethers.getContractAt('ComposableStablePoolFactory', FACTORY_ADDRESS);

    // Sort tokens by address (required by Balancer)
    const sortedTokens = [
      MOCK_TOKENS.shMON,
      MOCK_TOKENS.sMON,
      MOCK_TOKENS.gMON,
      MOCK_TOKENS.aprMON,
    ].sort((a, b) => a.localeCompare(b));

    console.log('Sorted tokens:', sortedTokens);

    // Pool configuration without rate providers
    const poolConfig = {
      name: 'Test Pool No Rates',
      symbol: 'TPNR',
      tokens: sortedTokens,
      rateProviders: [
        ethers.constants.AddressZero, // No rate provider for shMON
        ethers.constants.AddressZero, // No rate provider for sMON
        ethers.constants.AddressZero, // No rate provider for gMON
        ethers.constants.AddressZero, // No rate provider for aprMON
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
      swapFeePercentage: ethers.utils.parseEther('0.001'), // 0.1% - low fee for stable assets
      amplificationParameter: 200, // A = 200 (stable pool)
      owner: deployer.address,
    };

    console.log('\n--- Pool Configuration ---');
    console.log('- Name:', poolConfig.name);
    console.log('- Symbol:', poolConfig.symbol);
    console.log('- Tokens:', poolConfig.tokens);
    console.log('- Rate Providers:', poolConfig.rateProviders);
    console.log('- Swap Fee:', ethers.utils.formatEther(poolConfig.swapFeePercentage), '%');
    console.log('- Amplification:', poolConfig.amplificationParameter);
    console.log('- Owner:', poolConfig.owner);

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
      poolConfig.owner,
      ethers.utils.randomBytes(32) // salt
    );

    console.log('✅ Pool creation transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Pool creation confirmed!');

    // Get the pool address from the event
    const poolCreatedEvent = receipt.events?.find((e: any) => e.event === 'PoolCreated');
    if (poolCreatedEvent) {
      const poolAddress = poolCreatedEvent.args?.pool;
      console.log('\n🎉 === POOL CREATED SUCCESSFULLY === 🎉');
      console.log('Pool address:', poolAddress);
      console.log('Pool name:', poolConfig.name);
      console.log('Pool symbol:', poolConfig.symbol);
      
      console.log('\n📝 Next Steps:');
      console.log('1. Test adding liquidity to this pool');
      console.log('2. Compare with the rate provider pool');
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