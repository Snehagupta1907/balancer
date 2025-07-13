/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Testing simple pool join');
  console.log('Account:', deployer.address);

  // Pool address from successful deployment
  const POOL_ADDRESS = '0x84e4724ecaaCA943345D112423E64431bd3a3887';
  const VAULT_ADDRESS = '0x598265DC45aDA61227153a96A3d20Ea0Fa198B0E';

  // Mock token addresses from deploy-core-only.ts
  const MOCK_TOKENS = {
    shMON: '0x747ee810C8477F2e85A88ea66A5e03C9494A2cfc',
    sMON: '0xeAB8785e3D2E48E5b24689D7e98c88f91Fd8170D',
    gMON: '0xE04fa707fAcAF0441E5983aCDCB89FfCC457234b',
    aprMON: '0x75714FE9Fc17a84097e6194b3B024716AD5a2bE7',
  };

  try {
    console.log('\n=== Testing Simple Pool Join ===');

    // Get contracts
    const pool = await ethers.getContractAt('ComposableStablePool', POOL_ADDRESS);
    const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS);
    
    // Get mock token contracts
    const mockShMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.shMON);
    const mockSMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.sMON);
    const mockGMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.gMON);
    const mockAprMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.aprMON);

    // Step 1: Mint tokens
    console.log('\n--- Step 1: Minting tokens ---');
    await mockShMON.mint(deployer.address, ethers.utils.parseEther('1000'));
    await mockSMON.mint(deployer.address, ethers.utils.parseEther('1000'));
    await mockGMON.mint(deployer.address, ethers.utils.parseEther('1000'));
    await mockAprMON.mint(deployer.address, ethers.utils.parseEther('1000'));
    console.log('✅ Minted 1000 tokens of each mock LST');

    // Step 2: Approve tokens
    console.log('\n--- Step 2: Approving tokens ---');
    await mockShMON.approve(vault.address, ethers.constants.MaxUint256);
    await mockSMON.approve(vault.address, ethers.constants.MaxUint256);
    await mockGMON.approve(vault.address, ethers.constants.MaxUint256);
    await mockAprMON.approve(vault.address, ethers.constants.MaxUint256);
    console.log('✅ Approved all tokens for vault');

    // Step 3: Try to add minimal liquidity
    console.log('\n--- Step 3: Adding minimal liquidity ---');
    
    const poolId = await pool.getPoolId();
    console.log('Pool ID:', poolId);

    // Get sorted tokens from vault
    const { tokens } = await vault.getPoolTokens(poolId);
    console.log('Sorted tokens:', tokens);

    // Create minimal amounts (0.001 tokens each)
    const amountsIn = [
      ethers.utils.parseEther('0.001'), // shMON
      ethers.utils.parseEther('0.001'), // aprMON
      0, // BPT
      ethers.utils.parseEther('0.001'), // gMON
      ethers.utils.parseEther('0.001'), // sMON
    ];

    console.log('Amounts in:', amountsIn.map(a => ethers.utils.formatEther(a)));

    // Create join user data
    const userData = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256[]'],
      [0, amountsIn] // JOIN_KIND_INIT = 0
    );

    // Join pool
    const joinPoolRequest = {
      assets: tokens,
      maxAmountsIn: Array(5).fill(ethers.constants.MaxUint256), // Use MaxUint256 to allow any amount
      userData: userData,
      fromInternalBalance: false,
    };

    console.log('Attempting to join pool with minimal amounts...');
    const tx = await vault.joinPool(
      poolId,
      deployer.address,
      deployer.address,
      joinPoolRequest
    );

    console.log('✅ Join transaction sent:', tx.hash);
    await tx.wait();
    console.log('✅ Join transaction confirmed!');

    // Check balances after join
    console.log('\n--- Step 4: Checking balances after join ---');
    const { balances } = await vault.getPoolTokens(poolId);
    console.log('Pool token balances:', balances.map((b: any) => ethers.utils.formatEther(b)));

    console.log('\n✅ Simple pool join test completed successfully!');

  } catch (error) {
    console.error('❌ Simple pool join test failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 