/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import { Contract, ContractFactory } from 'ethers';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying stable pool contracts for LST tokens with account:', deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(await deployer.getBalance()));

  // Monad WMON address
  const MONAD_WMON_ADDRESS = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";

  try {
    // Step 1: Deploy SimpleAuthorizer
    console.log('\n=== Step 1: Deploying SimpleAuthorizer ===');
    const SimpleAuthorizer = await ethers.getContractFactory('SimpleAuthorizer');
    const authorizer = await SimpleAuthorizer.deploy(deployer.address);
    await authorizer.deployed();
    console.log('SimpleAuthorizer deployed to:', authorizer.address);

    // Step 2: Deploy Vault
    console.log('\n=== Step 2: Deploying Vault ===');
    const Vault = await ethers.getContractFactory('Vault');
    const vault = await Vault.deploy(
        authorizer.address,
        MONAD_WMON_ADDRESS, // WMON address for Monad
        0, // pauseWindowDuration
        0  // bufferPeriodDuration
    );
    await vault.deployed();
    console.log('Vault deployed to:', vault.address);

    // Step 3: Get ProtocolFeesCollector
    console.log('\n=== Step 3: Getting ProtocolFeesCollector ===');
    console.log('Vault address:', vault);
    const protocolFeesCollectorAddress = await vault.getProtocolFeesCollector();
    console.log('ProtocolFeesCollector address:', protocolFeesCollectorAddress);

    // Step 4: Deploy ComposableStablePoolFactory
    console.log('\n=== Step 4: Deploying ComposableStablePoolFactory ===');
    const ComposableStablePoolFactory = await ethers.getContractFactory('ComposableStablePoolFactory');
    const stablePoolFactory = await ComposableStablePoolFactory.deploy(vault.address, protocolFeesCollectorAddress, "1.0.0", "1.0.0", 0, 0);
    await stablePoolFactory.deployed();
    console.log('ComposableStablePoolFactory deployed to:', stablePoolFactory.address);

    // Step 5: Deploy StableMath (for stable pool calculations)
    console.log('\n=== Step 5: Deploying StableMath ===');
    const StableMath = await ethers.getContractFactory('StableMath');
    const stableMath = await StableMath.deploy();
    await stableMath.deployed();
    console.log('StableMath deployed to:', stableMath.address);

    // Step 6: Deploy ComposableStablePool (the actual stable pool implementation)
    console.log('\n=== Step 6: Deploying ComposableStablePool ===');
    const ComposableStablePool = await ethers.getContractFactory('ComposableStablePool');
    const stablePool = await ComposableStablePool.deploy(
        vault.address,
        'LST Stable Pool', // name
        'LSTSP',           // symbol
        [],                // tokens (will be set when creating pool)
        [],                // amplification parameter (will be set)
        [],                // rateProviders (will be set when creating pool)
        [],                // assetManagers (will be set when creating pool)
        100                // swapFeePercentage (0.1% - lower for stable pools)
    );
    await stablePool.deployed();
    console.log('ComposableStablePool deployed to:', stablePool.address);

    // Step 7: Deploy ComposableStablePoolRates (for rate calculations)
    console.log('\n=== Step 7: Deploying ComposableStablePoolRates ===');
    const ComposableStablePoolRates = await ethers.getContractFactory('ComposableStablePoolRates');
    const stablePoolRates = await ComposableStablePoolRates.deploy();
    await stablePoolRates.deployed();
    console.log('ComposableStablePoolRates deployed to:', stablePoolRates.address);

    // Step 8: Deploy ComposableStablePoolProtocolFees
    console.log('\n=== Step 8: Deploying ComposableStablePoolProtocolFees ===');
    const ComposableStablePoolProtocolFees = await ethers.getContractFactory('ComposableStablePoolProtocolFees');
    const stablePoolProtocolFees = await ComposableStablePoolProtocolFees.deploy();
    await stablePoolProtocolFees.deployed();
    console.log('ComposableStablePoolProtocolFees deployed to:', stablePoolProtocolFees.address);

    console.log('\n=== Deployment Summary ===');
    console.log('SimpleAuthorizer:', authorizer.address);
    console.log('Vault:', vault.address);
    console.log('ProtocolFeesCollector:', protocolFeesCollectorAddress);
    console.log('ComposableStablePoolFactory:', stablePoolFactory.address);
    console.log('StableMath:', stableMath.address);
    console.log('ComposableStablePool:', stablePool.address);
    console.log('ComposableStablePoolRates:', stablePoolRates.address);
    console.log('ComposableStablePoolProtocolFees:', stablePoolProtocolFees.address);

    console.log('\n=== Why Stable Pool for LST Tokens ===');
    console.log('✅ Lower slippage for similar-priced LST tokens');
    console.log('✅ Better for LST tokens that should trade near 1:1');
    console.log('✅ More capital efficient for large swaps');
    console.log('✅ Ideal for shMON, sMON, gMON, aprMON with similar prices');

    console.log('\n=== Next Steps ===');
    console.log('1. Deploy rate providers for your LST tokens');
    console.log('2. Create your stable pool using the factory');
    console.log('3. Set amplification parameter (recommended: 100-500)');
    console.log('4. Add initial liquidity to your pool');

  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 