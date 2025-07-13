/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Adding liquidity to LST pool WITH rate providers');
  console.log('Account:', deployer.address);

  // === UPDATE THESE ADDRESSES ===
  // Use your actual deployed addresses from previous scripts
  const POOL_ADDRESS = '0xd189cEdFa4c5eE76e44DE0A7155cDff3917Eda2b'; // Your LST pool with rates
  const VAULT_ADDRESS = '0x598265DC45aDA61227153a96A3d20Ea0Fa198B0E';

  // Mock token addresses from deploy-core-only.ts
  const MOCK_TOKENS = {
    shMON: '0x747ee810C8477F2e85A88ea66A5e03C9494A2cfc',
    sMON: '0xeAB8785e3D2E48E5b24689D7e98c88f91Fd8170D',
    gMON: '0xE04fa707fAcAF0441E5983aCDCB89FfCC457234b',
    aprMON: '0x75714FE9Fc17a84097e6194b3B024716AD5a2be7'
  };

  // Rate provider addresses from deploy-rate-providers.ts
  const RATE_PROVIDERS = {
    shMON: '0x...', // Add your deployed rate provider addresses
    sMON: '0x...',
    gMON: '0x...',
    aprMON: '0x...'
  };

  try {
    // Get contract instances
    const vault = await ethers.getContractAt('Vault', VAULT_ADDRESS);
    const pool = await ethers.getContractAt('ComposableStablePool', POOL_ADDRESS);

    // Get pool tokens and BPT
    const poolTokens = await pool.getTokens();
    const bptToken = await pool.getBptToken();
    
    console.log('\n=== Pool Information ===');
    console.log('Pool tokens:', poolTokens.tokens);
    console.log('BPT token:', bptToken);
    console.log('Token balances:', poolTokens.balances.map((b: any) => ethers.utils.formatEther(b)));

    // Get token contracts
    const shMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.shMON);
    const sMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.sMON);
    const gMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.gMON);
    const aprMON = await ethers.getContractAt('MockToken', MOCK_TOKENS.aprMON);

    // Check current balances
    console.log('\n=== Current Balances ===');
    const initialShMON = await shMON.balanceOf(deployer.address);
    const initialSMON = await sMON.balanceOf(deployer.address);
    const initialGMON = await gMON.balanceOf(deployer.address);
    const initialAprMON = await aprMON.balanceOf(deployer.address);
    const bptContract = await ethers.getContractAt('MockToken', bptToken);
    const initialBPT = await bptContract.balanceOf(deployer.address);

    console.log('shMON balance:', ethers.utils.formatEther(initialShMON));
    console.log('sMON balance:', ethers.utils.formatEther(initialSMON));
    console.log('gMON balance:', ethers.utils.formatEther(initialGMON));
    console.log('aprMON balance:', ethers.utils.formatEther(initialAprMON));
    console.log('BPT balance:', ethers.utils.formatEther(initialBPT));

    // Mint tokens if needed
    console.log('\n=== Minting Tokens (if needed) ===');
    const mintAmount = ethers.utils.parseEther('1000');
    
    if (initialShMON.lt(mintAmount)) {
      console.log('Minting shMON...');
      await shMON.mint(deployer.address, mintAmount);
    }
    if (initialSMON.lt(mintAmount)) {
      console.log('Minting sMON...');
      await sMON.mint(deployer.address, mintAmount);
    }
    if (initialGMON.lt(mintAmount)) {
      console.log('Minting gMON...');
      await gMON.mint(deployer.address, mintAmount);
    }
    if (initialAprMON.lt(mintAmount)) {
      console.log('Minting aprMON...');
      await aprMON.mint(deployer.address, mintAmount);
    }

    // Approve Vault to spend tokens
    console.log('\n=== Approving Vault ===');
    const approveAmount = ethers.constants.MaxUint256;
    
    await shMON.approve(VAULT_ADDRESS, approveAmount);
    await sMON.approve(VAULT_ADDRESS, approveAmount);
    await gMON.approve(VAULT_ADDRESS, approveAmount);
    await aprMON.approve(VAULT_ADDRESS, approveAmount);
    
    console.log('✅ All tokens approved');

    // === ADD LIQUIDITY ===
    console.log('\n=== Adding Liquidity ===');
    
    // Join amount (adjust as needed)
    const joinAmount = ethers.utils.parseEther('100'); // 100 tokens each
    
    // IMPORTANT: For EXACT_TOKENS_IN_FOR_BPT_OUT, amountsIn should NOT include BPT
    // The pool tokens order (excluding BPT) should match the amountsIn array
    const amountsIn = [
      joinAmount, // shMON
      joinAmount, // sMON  
      joinAmount, // gMON
      joinAmount  // aprMON
    ];

    console.log('Amounts in (excluding BPT):', amountsIn.map(a => ethers.utils.formatEther(a)));

    // Encode user data for EXACT_TOKENS_IN_FOR_BPT_OUT (kind 1)
    const userData = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint256[]'],
      [1, amountsIn] // kind 1 = EXACT_TOKENS_IN_FOR_BPT_OUT
    );

    // Prepare join request
    const joinRequest = {
      assets: poolTokens.tokens, // Include BPT in assets array
      maxAmountsIn: amountsIn.map(() => ethers.constants.MaxUint256), // Max amounts for each token
      userData: userData,
      fromInternalBalance: false
    };

    console.log('Join request prepared');
    console.log('Assets (including BPT):', joinRequest.assets);
    console.log('Max amounts in:', joinRequest.maxAmountsIn.map(a => a.toString()));

    // Execute join
    console.log('\nExecuting join...');
    const joinTx = await vault.joinPool(
      poolTokens.tokens, // poolId (first element)
      deployer.address,  // sender
      deployer.address,  // recipient
      joinRequest
    );

    console.log('✅ Join transaction sent:', joinTx.hash);
    await joinTx.wait();
    console.log('✅ Join transaction confirmed!');

    // Check final balances
    console.log('\n=== Final Balances ===');
    const finalShMON = await shMON.balanceOf(deployer.address);
    const finalSMON = await sMON.balanceOf(deployer.address);
    const finalGMON = await gMON.balanceOf(deployer.address);
    const finalAprMON = await aprMON.balanceOf(deployer.address);
    const finalBPT = await bptContract.balanceOf(deployer.address);

    console.log('shMON balance:', ethers.utils.formatEther(finalShMON));
    console.log('sMON balance:', ethers.utils.formatEther(finalSMON));
    console.log('gMON balance:', ethers.utils.formatEther(finalGMON));
    console.log('aprMON balance:', ethers.utils.formatEther(finalAprMON));
    console.log('BPT balance:', ethers.utils.formatEther(finalBPT));

    // Calculate changes
    const shMONChange = initialShMON.sub(finalShMON);
    const sMONChange = initialSMON.sub(finalSMON);
    const gMONChange = initialGMON.sub(finalGMON);
    const aprMONChange = initialAprMON.sub(finalAprMON);
    const bptGained = finalBPT.sub(initialBPT);

    console.log('\n=== Changes ===');
    console.log('shMON spent:', ethers.utils.formatEther(shMONChange));
    console.log('sMON spent:', ethers.utils.formatEther(sMONChange));
    console.log('gMON spent:', ethers.utils.formatEther(gMONChange));
    console.log('aprMON spent:', ethers.utils.formatEther(aprMONChange));
    console.log('BPT gained:', ethers.utils.formatEther(bptGained));

    // Check pool balances
    const finalPoolTokens = await pool.getTokens();
    console.log('\n=== Final Pool Balances ===');
    console.log('Pool token balances:', finalPoolTokens.balances.map((b: any) => ethers.utils.formatEther(b)));

    console.log('\n🎉 === LST POOL WITH RATES - LIQUIDITY ADDED SUCCESSFULLY === 🎉');

  } catch (error) {
    console.error('❌ LST pool with rates join failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 