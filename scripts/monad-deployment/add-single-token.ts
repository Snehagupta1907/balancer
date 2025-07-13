/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Adding single token to test join functionality');
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
    console.log('\n=== Adding Single Token ===');

    // Get contracts
    const pool = await ethers.getContractAt('ComposableStablePool', POOL_ADDRESS);
    const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS);
    
    // Get mock token contracts
    const mockShMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.shMON);

    // Check current BPT balance
    const initialBPTBalance = await pool.balanceOf(deployer.address);
    console.log('\n--- Current BPT Balance ---');
    console.log('Initial BPT balance:', ethers.utils.formatEther(initialBPTBalance));

    // Step 1: Check pool configuration
    console.log('\n--- Step 1: Checking Pool Configuration ---');
    const poolId = await pool.getPoolId();
    const { tokens } = await vault.getPoolTokens(poolId);
    const { balances: currentBalances } = await vault.getPoolTokens(poolId);
    
    console.log('Pool tokens:', tokens);
    console.log('Current pool balances:', currentBalances.map((b: any) => ethers.utils.formatEther(b)));
    
    // Check amplification parameter
    const { value: ampValue, precision: ampPrecision } = await pool.getAmplificationParameter();
    const amplificationParameter = ampValue.div(ampPrecision);
    console.log('Amplification parameter:', amplificationParameter.toString());
    console.log('Amplification precision:', ampPrecision.toString());
    
    // Check if pool has any liquidity (excluding BPT)
    const nonBptBalances = currentBalances.filter((_: any, i: number) => tokens[i] !== pool.address);
    const totalNonBptBalance = nonBptBalances.reduce((sum: any, balance: any) => sum.add(balance), ethers.BigNumber.from(0));
    
    console.log('Total non-BPT balance:', ethers.utils.formatEther(totalNonBptBalance));
    
    // If pool is not initialized (no liquidity), initialize it first
    if (totalNonBptBalance.isZero()) {
      console.log('\n--- Pool not initialized. Adding initial liquidity first ---');
      
      // Add small initial liquidity (1 token each)
      const initialAmounts = [
        ethers.utils.parseEther('1'), // shMON
        ethers.utils.parseEther('1'), // aprMON
        0, // BPT (will be minted)
        ethers.utils.parseEther('1'), // gMON
        ethers.utils.parseEther('1'), // sMON
      ];
      
      const initUserData = ethers.utils.defaultAbiCoder.encode(
        ['uint256', 'uint256[]'],
        [0, initialAmounts] // JOIN_KIND_INIT = 0
      );
      
      const initRequest = {
        assets: tokens,
        maxAmountsIn: Array(5).fill(ethers.constants.MaxUint256),
        userData: initUserData,
        fromInternalBalance: false,
      };
      
      console.log('Initializing pool with amounts:', initialAmounts.map(a => ethers.utils.formatEther(a)));
      const initTx = await vault.joinPool(poolId, deployer.address, deployer.address, initRequest);
      await initTx.wait();
      console.log('✅ Pool initialized successfully!');
      
      // Update balances after initialization
      const { balances: newBalances } = await vault.getPoolTokens(poolId);
      console.log('Pool balances after initialization:', newBalances.map((b: any) => ethers.utils.formatEther(b)));
    }

    // Step 2: Add single token (shMON only) with very small amount
    console.log('\n--- Step 2: Adding Single Token (shMON) ---');
    
    const { balances: initialBalances } = await vault.getPoolTokens(poolId);
    console.log('\n--- Current Pool Balances ---');
    console.log('Pool balances:', initialBalances.map((b: any) => ethers.utils.formatEther(b)));

    // Use very small amount - 0.1 tokens instead of 10
    const amountsIn = [
      ethers.utils.parseEther('0.1'), // 0.1 shMON (very small)
      0, // aprMON
      0, // gMON
      0, // sMON
    ];

    console.log('Amounts in:', amountsIn.map(a => ethers.utils.formatEther(a)));

    const minBPTAmountOut = ethers.utils.parseEther('0.01'); // Minimum 0.01 BPT token
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

    console.log('Attempting to join pool with single token...');
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
    console.log('Expected shMON change:', '0.1');
    console.log('Actual vs Expected match:', shMONChange.eq(ethers.utils.parseEther('0.1')));

    console.log('\n✅ Single token join test completed!');

  } catch (error) {
    console.error('❌ Single token join failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 