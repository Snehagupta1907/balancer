/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Adding more liquidity to test BPT distribution');
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
    console.log('\n=== Adding More Liquidity ===');

    // Get contracts
    const pool = await ethers.getContractAt('ComposableStablePool', POOL_ADDRESS);
    const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS);
    
    // Get mock token contracts
    const mockShMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.shMON);
    const mockSMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.sMON);
    const mockGMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.gMON);
    const mockAprMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.aprMON);

    // Check current BPT balance
    const initialBPTBalance = await pool.balanceOf(deployer.address);
    console.log('\n--- Current BPT Balance ---');
    console.log('Initial BPT balance:', ethers.utils.formatEther(initialBPTBalance));

    // Step 1: Add more liquidity (10 tokens each)
    console.log('\n--- Step 1: Adding More Liquidity ---');
    
    const poolId = await pool.getPoolId();
    const { tokens } = await vault.getPoolTokens(poolId);

    // Create larger amounts (10 tokens each)
    const amountsIn = [
      ethers.utils.parseEther('10'), // shMON
      ethers.utils.parseEther('10'), // aprMON
      0, // BPT
      ethers.utils.parseEther('10'), // gMON
      ethers.utils.parseEther('10'), // sMON
    ];

    console.log('Amounts in:', amountsIn.map(a => ethers.utils.formatEther(a)));

    // Create join user data - use all tokens in for exact BPT out
    const desiredBPT = ethers.utils.parseEther('10'); // Want 10 BPT tokens
    const userData = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [1, desiredBPT] // JOIN_KIND_ALL_TOKENS_IN_FOR_EXACT_BPT_OUT = 1
    );

    // Join pool
    const joinPoolRequest = {
      assets: tokens,
      maxAmountsIn: Array(5).fill(ethers.constants.MaxUint256),
      userData: userData,
      fromInternalBalance: false,
    };

    console.log('Attempting to join pool with larger amounts...');
    const tx = await vault.joinPool(
      poolId,
      deployer.address,
      deployer.address,
      joinPoolRequest
    );

    console.log('✅ Join transaction sent:', tx.hash);
    await tx.wait();
    console.log('✅ Join transaction confirmed!');

    // Check BPT balance after join
    const finalBPTBalance = await pool.balanceOf(deployer.address);
    console.log('\n--- Final BPT Balance ---');
    console.log('Final BPT balance:', ethers.utils.formatEther(finalBPTBalance));
    console.log('BPT gained:', ethers.utils.formatEther(finalBPTBalance.sub(initialBPTBalance)));

    // Check pool balances
    const { balances } = await vault.getPoolTokens(poolId);
    console.log('\n--- Pool Balances After Join ---');
    console.log('Pool token balances:', balances.map((b: any) => ethers.utils.formatEther(b)));

    console.log('\n✅ More liquidity added successfully!');

  } catch (error) {
    console.error('❌ Add more liquidity failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 