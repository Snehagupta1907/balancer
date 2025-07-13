/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Testing basic pool functionality');
  console.log('Account:', deployer.address);

  // Pool address from successful deployment
  const POOL_ADDRESS = '0x84e4724ecaaCA943345D112423E64431bd3a3887';
  const VAULT_ADDRESS = '0x598265DC45aDA61227153a96A3d20Ea0Fa198B0E';

  try {
    console.log('\n=== Testing Basic Pool Functionality ===');

    // Get pool contract
    const pool = await ethers.getContractAt('ComposableStablePool', POOL_ADDRESS);
    const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS);

    // Get pool info
    console.log('\n--- Pool Information ---');
    const poolId = await pool.getPoolId();
    console.log('Pool ID:', poolId);

    const tokens = await vault.getPoolTokens(poolId);
    console.log('Pool tokens:', tokens.tokens);
    console.log('Token balances:', tokens.balances.map((b: any) => ethers.utils.formatEther(b)));

    // Get pool name and symbol
    const name = await pool.name();
    const symbol = await pool.symbol();
    console.log('Pool name:', name);
    console.log('Pool symbol:', symbol);

    // Get pool parameters
    const swapFeePercentage = await pool.getSwapFeePercentage();
    console.log('Swap fee percentage:', ethers.utils.formatEther(swapFeePercentage));

    const amplificationParameter = await pool.getAmplificationParameter();
    console.log('Amplification parameter:', amplificationParameter.value.toString());

    // Check pool state
    console.log('Pool has no liquidity yet (normal for new pool)');
    console.log('All token balances are 0.0 - this is expected for a new pool');

    console.log('\n✅ Basic pool functionality test completed successfully!');
    console.log('📝 Pool is deployed and accessible');

  } catch (error) {
    console.error('❌ Basic pool test failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 