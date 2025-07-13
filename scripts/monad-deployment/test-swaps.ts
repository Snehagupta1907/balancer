/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Testing swaps between tokens');
  console.log('Account:', deployer.address);

  const POOL_ADDRESS = '0x84e4724ecaaCA943345D112423E64431bd3a3887';
  const VAULT_ADDRESS = '0x598265DC45aDA61227153a96A3d20Ea0Fa198B0E';

  const MOCK_TOKENS = {
    shMON: '0x747ee810C8477F2e85A88ea66A5e03C9494A2cfc',
    sMON: '0xeAB8785e3D2E48E5b24689D7e98c88f91Fd8170D',
    gMON: '0xE04fa707fAcAF0441E5983aCDCB89FfCC457234b',
    aprMON: '0x75714FE9Fc17a84097e6194b3B024716AD5a2bE7',
  };

  try {
    console.log('\n=== Testing Swaps ===');

    const pool = await ethers.getContractAt('ComposableStablePool', POOL_ADDRESS);
    const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS);

    const mockShMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.shMON);
    const mockGMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.gMON);

    console.log('\n--- Initial Balances ---');
    const initialShMON = await mockShMON.balanceOf(deployer.address);
    const initialGMON = await mockGMON.balanceOf(deployer.address);
    console.log('Initial shMON balance:', ethers.utils.formatEther(initialShMON));
    console.log('Initial gMON balance:', ethers.utils.formatEther(initialGMON));

    const poolId = await pool.getPoolId();
    const { tokens } = await vault.getPoolTokens(poolId);
    console.log('Pool tokens:', tokens);

    console.log('\n--- Step 1: Approving Tokens ---');
    await mockShMON.approve(vault.address, ethers.constants.MaxUint256);
    await mockGMON.approve(vault.address, ethers.constants.MaxUint256);
    console.log('✅ Approved shMON and gMON for vault');

    // Step 1.5: Add more liquidity to improve swap rates
    console.log('\n--- Step 1.5: Adding More Liquidity for Better Swap Rates ---');
    
    // Check current pool state first
    const { balances: currentBalances } = await vault.getPoolTokens(poolId);
    console.log('Current pool balances:', currentBalances.map((b: any) => ethers.utils.formatEther(b)));
    
    // Add more tokens to the pool to increase liquidity
    // Use smaller amounts to avoid issues
    const addLiquidityAmounts = [
      ethers.utils.parseEther('1'), // 1 shMON
      ethers.utils.parseEther('1'), // 1 aprMON  
      0, // BPT (will be minted)
      ethers.utils.parseEther('1'), // 1 gMON
      ethers.utils.parseEther('1'), // 1 sMON
    ];

    console.log('Adding liquidity amounts:', addLiquidityAmounts.map(a => ethers.utils.formatEther(a)));
    console.log('Tokens array length:', tokens.length);
    console.log('Amounts array length:', addLiquidityAmounts.length);

    const addLiquidityUserData = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [1, addLiquidityAmounts, ethers.utils.parseEther('0.01')] // JOIN_KIND_EXACT_TOKENS_IN_FOR_BPT_OUT = 1
    );

    const addLiquidityRequest = {
      assets: tokens,
      maxAmountsIn: Array(tokens.length).fill(ethers.constants.MaxUint256),
      userData: addLiquidityUserData,
      fromInternalBalance: false,
    };

    console.log('Adding more liquidity to improve swap rates...');
    const addLiquidityTx = await vault.joinPool(poolId, deployer.address, deployer.address, addLiquidityRequest);
    await addLiquidityTx.wait();
    console.log('✅ Added more liquidity successfully!');

    // Check pool balances after adding liquidity
    const { balances: newBalances } = await vault.getPoolTokens(poolId);
    console.log('Pool balances after adding liquidity:', newBalances.map((b: any) => ethers.utils.formatEther(b)));

    // Step 2: Test swap shMON → gMON using Vault's swap function
    console.log('\n--- Step 2: Swapping shMON → gMON via Vault ---');

    const swapAmount = ethers.utils.parseEther('0.05');

    const singleSwap = {
      poolId: poolId,
      kind: 0, // SwapKind.GIVEN_IN
      assetIn: MOCK_TOKENS.shMON,
      assetOut: MOCK_TOKENS.gMON,
      amount: swapAmount,
      userData: '0x',
    };

    const funds = {
      sender: deployer.address,
      recipient: deployer.address,
      fromInternalBalance: false,
      toInternalBalance: false,
    };

    const limit = 0; // no minimum output constraint
    const deadline = Math.floor(Date.now() / 1000) + 60; // 1 minute from now

    console.log('Swapping 0.05 shMON for gMON...');
    console.log('Single swap:', singleSwap);

    const tx = await vault.swap(singleSwap, funds, limit, deadline);
    await tx.wait();
    console.log('✅ Swap completed successfully!');

    console.log('\n--- Balances After Swap ---');
    const finalShMON = await mockShMON.balanceOf(deployer.address);
    const finalGMON = await mockGMON.balanceOf(deployer.address);
    console.log('Final shMON balance:', ethers.utils.formatEther(finalShMON));
    console.log('Final gMON balance:', ethers.utils.formatEther(finalGMON));

    const shMONUsed = initialShMON.sub(finalShMON);
    const gMONReceived = finalGMON.sub(initialGMON);
    console.log('shMON used:', ethers.utils.formatEther(shMONUsed));
    console.log('gMON received:', ethers.utils.formatEther(gMONReceived));

    console.log('\n✅ Swap testing completed successfully!');
  } catch (error) {
    console.error('❌ Swap testing failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
