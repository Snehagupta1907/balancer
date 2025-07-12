/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import { Contract, ContractFactory } from 'ethers';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying weighted pool contracts with account:', deployer.address);
  console.log('Account balance:', ethers.utils.formatEther(await deployer.getBalance()));

  // Monad WMON address (replace with actual Monad WMON address)
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

    // Step 3: Get ProtocolFeesCollector (automatically created by Vault)
    console.log('\n=== Step 3: Getting ProtocolFeesCollector ===');
    const protocolFeesCollectorAddress = await vault.getProtocolFeesCollector();
    console.log('ProtocolFeesCollector address:', protocolFeesCollectorAddress);

    // Step 4: Deploy WeightedPoolFactory
    console.log('\n=== Step 4: Deploying WeightedPoolFactory ===');
    const WeightedPoolFactory = await ethers.getContractFactory('WeightedPoolFactory');
    const weightedPoolFactory = await WeightedPoolFactory.deploy(vault.address);
    await weightedPoolFactory.deployed();
    console.log('WeightedPoolFactory deployed to:', weightedPoolFactory.address);

    // Step 5: Deploy WeightedPool2TokensFactory (for 2-token pools)
    console.log('\n=== Step 5: Deploying WeightedPool2TokensFactory ===');
    const WeightedPool2TokensFactory = await ethers.getContractFactory('WeightedPool2TokensFactory');
    const weightedPool2TokensFactory = await WeightedPool2TokensFactory.deploy(vault.address);
    await weightedPool2TokensFactory.deployed();
    console.log('WeightedPool2TokensFactory deployed to:', weightedPool2TokensFactory.address);

    // Step 6: Deploy WeightedPoolV2Factory (latest version)
    console.log('\n=== Step 6: Deploying WeightedPoolV2Factory ===');
    const WeightedPoolV2Factory = await ethers.getContractFactory('WeightedPoolV2Factory');
    const weightedPoolV2Factory = await WeightedPoolV2Factory.deploy(vault.address);
    await weightedPoolV2Factory.deployed();
    console.log('WeightedPoolV2Factory deployed to:', weightedPoolV2Factory.address);

    // Step 7: Deploy WeightedMath (for calculations)
    console.log('\n=== Step 7: Deploying WeightedMath ===');
    const WeightedMath = await ethers.getContractFactory('WeightedMath');
    const weightedMath = await WeightedMath.deploy();
    await weightedMath.deployed();
    console.log('WeightedMath deployed to:', weightedMath.address);

    // Step 8: Deploy ExternalWeightedMath (for external calculations)
    console.log('\n=== Step 8: Deploying ExternalWeightedMath ===');
    const ExternalWeightedMath = await ethers.getContractFactory('ExternalWeightedMath');
    const externalWeightedMath = await ExternalWeightedMath.deploy(weightedMath.address);
    await externalWeightedMath.deployed();
    console.log('ExternalWeightedMath deployed to:', externalWeightedMath.address);

    // Step 9: Deploy WeightedPoolToken (for pool tokens)
    console.log('\n=== Step 9: Deploying WeightedPoolToken ===');
    const WeightedPoolToken = await ethers.getContractFactory('WeightedPoolToken');
    const weightedPoolToken = await WeightedPoolToken.deploy();
    await weightedPoolToken.deployed();
    console.log('WeightedPoolToken deployed to:', weightedPoolToken.address);

    // Step 10: Deploy WeightedPool (the actual pool implementation)
    console.log('\n=== Step 10: Deploying WeightedPool ===');
    const WeightedPool = await ethers.getContractFactory('WeightedPool');
    const weightedPool = await WeightedPool.deploy(
        vault.address,
        'LST Pool', // name
        'LSTP',     // symbol
        [],         // tokens (will be set when creating pool)
        [],         // weights (will be set when creating pool)
        [],         // rateProviders (will be set when creating pool)
        [],         // assetManagers (will be set when creating pool)
        300         // swapFeePercentage (0.3%)
    );
    await weightedPool.deployed();
    console.log('WeightedPool deployed to:', weightedPool.address);

    // Step 11: Deploy WeightedPool2Tokens (for 2-token pools)
    console.log('\n=== Step 11: Deploying WeightedPool2Tokens ===');
    const WeightedPool2Tokens = await ethers.getContractFactory('WeightedPool2Tokens');
    const weightedPool2Tokens = await WeightedPool2Tokens.deploy(
        vault.address,
        'LST Pool 2T', // name
        'LSTP2T',      // symbol
        [],            // tokens (will be set when creating pool)
        [],            // weights (will be set when creating pool)
        [],            // rateProviders (will be set when creating pool)
        [],            // assetManagers (will be set when creating pool)
        300            // swapFeePercentage (0.3%)
    );
    await weightedPool2Tokens.deployed();
    console.log('WeightedPool2Tokens deployed to:', weightedPool2Tokens.address);

    // Step 12: Deploy WeightedPoolV2 (latest version)
    console.log('\n=== Step 12: Deploying WeightedPoolV2 ===');
    const WeightedPoolV2 = await ethers.getContractFactory('WeightedPoolV2');
    const weightedPoolV2 = await WeightedPoolV2.deploy(
        vault.address,
        'LST Pool V2', // name
        'LSTPV2',      // symbol
        [],            // tokens (will be set when creating pool)
        [],            // weights (will be set when creating pool)
        [],            // rateProviders (will be set when creating pool)
        [],            // assetManagers (will be set when creating pool)
        300            // swapFeePercentage (0.3%)
    );
    await weightedPoolV2.deployed();
    console.log('WeightedPoolV2 deployed to:', weightedPoolV2.address);

    // Step 13: Deploy WeightedPoolV2Factory (for creating V2 pools)
    console.log('\n=== Step 13: Deploying WeightedPoolV2Factory ===');
    const WeightedPoolV2Factory2 = await ethers.getContractFactory('WeightedPoolV2Factory');
    const weightedPoolV2Factory2 = await WeightedPoolV2Factory2.deploy(vault.address);
    await weightedPoolV2Factory2.deployed();
    console.log('WeightedPoolV2Factory2 deployed to:', weightedPoolV2Factory2.address);

    // Step 14: Deploy WeightedPoolV2Factory (for creating V2 pools)
    console.log('\n=== Step 14: Deploying WeightedPoolV2Factory ===');
    const WeightedPoolV2Factory3 = await ethers.getContractFactory('WeightedPoolV2Factory');
    const weightedPoolV2Factory3 = await WeightedPoolV2Factory3.deploy(vault.address);
    await weightedPoolV2Factory3.deployed();
    console.log('WeightedPoolV2Factory3 deployed to:', weightedPoolV2Factory3.address);

    // Step 15: Deploy WeightedPoolV2Factory (for creating V2 pools)
    console.log('\n=== Step 15: Deploying WeightedPoolV2Factory ===');
    const WeightedPoolV2Factory4 = await ethers.getContractFactory('WeightedPoolV2Factory');
    const weightedPoolV2Factory4 = await WeightedPoolV2Factory4.deploy(vault.address);
    await weightedPoolV2Factory4.deployed();
    console.log('WeightedPoolV2Factory4 deployed to:', weightedPoolV2Factory4.address);

    // Step 16: Deploy WeightedPoolV2Factory (for creating V2 pools)
    console.log('\n=== Step 16: Deploying WeightedPoolV2Factory ===');
    const WeightedPoolV2Factory5 = await ethers.getContractFactory('WeightedPoolV2Factory');
    const weightedPoolV2Factory5 = await WeightedPoolV2Factory5.deploy(vault.address);
    await weightedPoolV2Factory5.deployed();
    console.log('WeightedPoolV2Factory5 deployed to:', weightedPoolV2Factory5.address);

    // Step 17: Deploy WeightedPoolV2Factory (for creating V2 pools)
    console.log('\n=== Step 17: Deploying WeightedPoolV2Factory ===');
    const WeightedPoolV2Factory6 = await ethers.getContractFactory('WeightedPoolV2Factory');
    const weightedPoolV2Factory6 = await WeightedPoolV2Factory6.deploy(vault.address);
    await weightedPoolV2Factory6.deployed();
    console.log('WeightedPoolV2Factory6 deployed to:', weightedPoolV2Factory6.address);

    // Step 18: Deploy WeightedPoolV2Factory (for creating V2 pools)
    console.log('\n=== Step 18: Deploying WeightedPoolV2Factory ===');
    const WeightedPoolV2Factory7 = await ethers.getContractFactory('WeightedPoolV2Factory');
    const weightedPoolV2Factory7 = await WeightedPoolV2Factory7.deploy(vault.address);
    await weightedPoolV2Factory7.deployed();
    console.log('WeightedPoolV2Factory7 deployed to:', weightedPoolV2Factory7.address);

    // Step 19: Deploy WeightedPoolV2Factory (for creating V2 pools)
    console.log('\n=== Step 19: Deploying WeightedPoolV2Factory ===');
    const WeightedPoolV2Factory8 = await ethers.getContractFactory('WeightedPoolV2Factory');
    const weightedPoolV2Factory8 = await WeightedPoolV2Factory8.deploy(vault.address);
    await weightedPoolV2Factory8.deployed();
    console.log('WeightedPoolV2Factory8 deployed to:', weightedPoolV2Factory8.address);

    // Step 20: Deploy WeightedPoolV2Factory (for creating V2 pools)
    console.log('\n=== Step 20: Deploying WeightedPoolV2Factory ===');
    const WeightedPoolV2Factory9 = await ethers.getContractFactory('WeightedPoolV2Factory');
    const weightedPoolV2Factory9 = await WeightedPoolV2Factory9.deploy(vault.address);
    await weightedPoolV2Factory9.deployed();
    console.log('WeightedPoolV2Factory9 deployed to:', weightedPoolV2Factory9.address);

    console.log('\n=== Deployment Summary ===');
    console.log('SimpleAuthorizer:', authorizer.address);
    console.log('Vault:', vault.address);
    console.log('ProtocolFeesCollector:', protocolFeesCollectorAddress);
    console.log('WeightedPoolFactory:', weightedPoolFactory.address);
    console.log('WeightedPool2TokensFactory:', weightedPool2TokensFactory.address);
    console.log('WeightedPoolV2Factory:', weightedPoolV2Factory.address);
    console.log('WeightedMath:', weightedMath.address);
    console.log('ExternalWeightedMath:', externalWeightedMath.address);
    console.log('WeightedPoolToken:', weightedPoolToken.address);
    console.log('WeightedPool:', weightedPool.address);
    console.log('WeightedPool2Tokens:', weightedPool2Tokens.address);
    console.log('WeightedPoolV2:', weightedPoolV2.address);

    console.log('\n=== Next Steps ===');
    console.log('1. Deploy rate providers for your LST tokens');
    console.log('2. Create your weighted pool using the factory');
    console.log('3. Add initial liquidity to your pool');

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