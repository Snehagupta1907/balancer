/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Creating LST stable pool with account:', deployer.address);

  // Deployed addresses from deploy-core-only.ts
  const FACTORY_ADDRESS = '0x584A90E3d3Fd90962C00d05C8f37300E9b4D97B3'; // ComposableStablePoolFactory
  const VAULT_ADDRESS = '0x598265DC45aDA61227153a96A3d20Ea0Fa198B0E';   // Vault

  // Mock LST token addresses from deploy-core-only.ts
  const LST_TOKENS = {
    shMON: '0x747ee810C8477F2e85A88ea66A5e03C9494A2cfc', // Mock shMON
    sMON: '0xeAB8785e3D2E48E5b24689D7e98c88f91Fd8170D',  // Mock sMON
    gMON: '0xE04fa707fAcAF0441E5983aCDCB89FfCC457234b',  // Mock gMON
    aprMON: '0x75714FE9Fc17a84097e6194b3B024716AD5a2bE7', // Mock aprMON
  };

  // Rate providers for LST tokens (deploy these first with deploy-rate-providers.ts)
  const RATE_PROVIDERS = {
    shMON: '0x373a69CBD8c45A124B10Ad6F6c611C67619f7dCA', // shMON rate provider - replace after running deploy-rate-providers.ts
    sMON: '0xbeF4c3674ae0Ff3344F6a16101f545A49262B282',  // sMON rate provider - replace after running deploy-rate-providers.ts
    gMON: '0x1de93445EbB8965F1Ba3aBB4152f75955F32D0eF',  // gMON rate provider - replace after running deploy-rate-providers.ts
    aprMON: '0x0DEEAB11455C93C0E04d0B04F0F602FB4F9a89e3', // aprMON rate provider - replace after running deploy-rate-providers.ts
  };

  try {
    console.log('\n=== Creating LST Stable Pool ===');

    // Get the factory contract
    const factory = await ethers.getContractAt('ComposableStablePoolFactory', FACTORY_ADDRESS);

    // Create sorted token arrays with matching rate providers
    const tokenData = [
      { token: LST_TOKENS.shMON, rateProvider: RATE_PROVIDERS.shMON, cacheDuration: 300, exempt: false },
      { token: LST_TOKENS.sMON, rateProvider: RATE_PROVIDERS.sMON, cacheDuration: 300, exempt: false },
      { token: LST_TOKENS.gMON, rateProvider: RATE_PROVIDERS.gMON, cacheDuration: 300, exempt: false },
      { token: LST_TOKENS.aprMON, rateProvider: RATE_PROVIDERS.aprMON, cacheDuration: 300, exempt: false },
    ].sort((a, b) => a.token.toLowerCase().localeCompare(b.token.toLowerCase()));

    // Pool configuration for LST tokens
    const poolConfig = {
      name: 'LST Stable Pool',
      symbol: 'LSTSP',
      tokens: tokenData.map(t => t.token),
      rateProviders: tokenData.map(t => t.rateProvider),
      tokenRateCacheDurations: tokenData.map(t => t.cacheDuration),
      exemptFromYieldProtocolFeeFlags: tokenData.map(t => t.exempt),
      swapFeePercentage: ethers.utils.parseEther('0.001'), // 0.1% - low fee for stable assets
      amplificationParameter: 200, // Amplification parameter (100-500 recommended)
      owner: deployer.address,
    };

    console.log('Pool configuration:');
    console.log('- Name:', poolConfig.name);
    console.log('- Symbol:', poolConfig.symbol);
    console.log('- Tokens:', poolConfig.tokens);
    console.log('- Rate Providers:', poolConfig.rateProviders);
    console.log('- Swap Fee:', ethers.utils.formatEther(poolConfig.swapFeePercentage), '%');
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
      poolConfig.owner,
      ethers.utils.randomBytes(32) // salt
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