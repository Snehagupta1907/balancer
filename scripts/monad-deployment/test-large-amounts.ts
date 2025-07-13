/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Testing with much larger amounts');
  console.log('Account:', deployer.address);

  // Pool address from successful deployment
  const POOL_ADDRESS = '0xd189cEdFa4c5eE76e44DE0A7155cDff3917Eda2b';
  const VAULT_ADDRESS = '0x598265DC45aDA61227153a96A3d20Ea0Fa198B0E';

  // Mock token addresses from deploy-core-only.ts
  const MOCK_TOKENS = {
    shMON: '0x747ee810C8477F2e85A88ea66A5e03C9494A2cfc',
    sMON: '0xeAB8785e3D2E48E5b24689D7e98c88f91Fd8170D',
    gMON: '0xE04fa707fAcAF0441E5983aCDCB89FfCC457234b',
    aprMON: '0x75714FE9Fc17a84097e6194b3B024716AD5a2bE7',
  };

  try {
    console.log('\n=== Testing Large Amounts ===');

    // Get contracts
    const pool = await ethers.getContractAt('ComposableStablePool', POOL_ADDRESS);
    const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS);
    
    // Get mock token contracts
    const mockShMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.shMON);

    // Check current BPT balance
    const initialBPTBalance = await pool.balanceOf(deployer.address);
    console.log('\n--- Current BPT Balance ---');
    console.log('Initial BPT balance:', ethers.utils.formatEther(initialBPTBalance));

    // Check current pool balances
    const poolId = await pool.getPoolId();
    const { balances: initialBalances } = await vault.getPoolTokens(poolId);
    console.log('\n--- Current Pool Balances ---');
    console.log('Pool balances:', initialBalances.map((b: any) => ethers.utils.formatEther(b)));

    // Step 1: Add very large amount (1000 tokens)
    console.log('\n--- Step 1: Adding Large Amount (1000 shMON) ---');
    
    const { tokens } = await vault.getPoolTokens(poolId);

    // Create amounts with large shMON amount - EXCLUDE BPT token (4 tokens instead of 5)
    const amountsIn = [
      ethers.utils.parseEther('1000'), // 1000 shMON
      0, // aprMON
      0, // gMON
      0, // sMON
    ];

    console.log('Amounts in:', amountsIn.map(a => ethers.utils.formatEther(a)));

    // Create join user data - use EXACT_TOKENS_IN_FOR_BPT_OUT (kind 1)
    const minBPTAmountOut = ethers.utils.parseEther('1'); // Minimum 1 BPT token
    const userData = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [1, amountsIn, minBPTAmountOut] // JOIN_KIND_EXACT_TOKENS_IN_FOR_BPT_OUT = 1
    );

    // Join pool
    const joinPoolRequest = {
      assets: tokens,
      maxAmountsIn: Array(5).fill(ethers.constants.MaxUint256),
      userData: userData,
      fromInternalBalance: false,
    };

    console.log('Attempting to join pool with large amount...');
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

    // Check pool balances after join
    const { balances: finalBalances } = await vault.getPoolTokens(poolId);
    console.log('\n--- Pool Balances After Join ---');
    console.log('Pool balances:', finalBalances.map((b: any) => ethers.utils.formatEther(b)));

    // Calculate changes
    console.log('\n--- Changes Analysis ---');
    const shMONChange = finalBalances[0].sub(initialBalances[0]);
    console.log('shMON change:', ethers.utils.formatEther(shMONChange));
    console.log('Expected shMON change:', '1000.0');
    console.log('Actual vs Expected match:', shMONChange.eq(ethers.utils.parseEther('1000')));

    console.log('\n✅ Large amount test completed!');

  } catch (error) {
    console.error('❌ Large amount test failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 