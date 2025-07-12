/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying core Balancer contracts only (for testing)');
  console.log('Account:', deployer.address);
  console.log('Balance:', ethers.utils.formatEther(await deployer.getBalance()));

  // Monad WMON address
  const MONAD_WMON_ADDRESS = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";



  try {
    // Step 1: Deploy SimpleAuthorizer
    console.log('\n=== Step 1: Deploying SimpleAuthorizer ===');
    const SimpleAuthorizer = await ethers.getContractFactory('SimpleAuthorizer');
    const authorizer = await SimpleAuthorizer.deploy(deployer.address);
    await authorizer.deployed();
    console.log('✅ SimpleAuthorizer:', authorizer.address);

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
    console.log('✅ Vault:', vault.address);

    // Step 3: Get ProtocolFeesCollector
    console.log('\n=== Step 3: Getting ProtocolFeesCollector ===');
    // console.log('Vault address:', vault);
    const protocolFeesCollectorAddress = await vault.getProtocolFeesCollector();
    console.log('✅ ProtocolFeesCollector:', protocolFeesCollectorAddress);

    const ProtocolFeePercentagesProvider = await ethers.getContractFactory('ProtocolFeePercentagesProvider');
    const protocolFeeProvider = await ProtocolFeePercentagesProvider.deploy(
      vault.address,
      ethers.utils.parseEther('0.8'), // 80% max yield fee
      ethers.utils.parseEther('0.2')  // 20% max AUM fee
    );
    await protocolFeeProvider.deployed();

    // Step 4: Deploy ComposableStablePoolFactory
    console.log('\n=== Step 4: Deploying ComposableStablePoolFactory ===');
    const ComposableStablePoolFactory = await ethers.getContractFactory('ComposableStablePoolFactory');
    const stablePoolFactory = await ComposableStablePoolFactory.deploy(vault.address, protocolFeeProvider.address, "1.0.0", "1.0.0", 0, 0);
    await stablePoolFactory.deployed();
    console.log('✅ ComposableStablePoolFactory:', stablePoolFactory.address);

    // Step 5: Deploy Mock Tokens for Testing
    console.log('\n=== Step 5: Deploying Mock LST Tokens for Testing ===');

    // Deploy Mock LST Token 1
    const MockToken = await ethers.getContractFactory('MockToken');
    const mockShMON = await MockToken.deploy('Mock shMON', 'shMON', 18);
    await mockShMON.deployed();
    console.log('✅ Mock shMON:', mockShMON.address);

    // Deploy Mock LST Token 2
    const mockSMON = await MockToken.deploy('Mock sMON', 'sMON', 18);
    await mockSMON.deployed();
    console.log('✅ Mock sMON:', mockSMON.address);

    // Deploy Mock LST Token 3
    const mockGMON = await MockToken.deploy('Mock gMON', 'gMON', 18);
    await mockGMON.deployed();
    console.log('✅ Mock gMON:', mockGMON.address);

    // Deploy Mock LST Token 4
    const mockAprMON = await MockToken.deploy('Mock aprMON', 'aprMON', 18);
    await mockAprMON.deployed();
    console.log('✅ Mock aprMON:', mockAprMON.address);

    console.log('\n🎉 === CORE DEPLOYMENT SUCCESSFUL === 🎉');
    console.log('\n📋 Deployed Addresses:');
    console.log('SimpleAuthorizer:', authorizer.address);
    console.log('Vault:', vault.address);
    console.log('ProtocolFeesCollector:', protocolFeesCollectorAddress);
    console.log('ComposableStablePoolFactory:', stablePoolFactory.address);
    console.log('\n🧪 Mock Tokens (for testing):');
    console.log('Mock shMON:', mockShMON.address);
    console.log('Mock sMON:', mockSMON.address);
    console.log('Mock gMON:', mockGMON.address);
    console.log('Mock aprMON:', mockAprMON.address);

    console.log('\n📝 Next Steps:');
    console.log('1. Test core contracts work correctly');
    console.log('2. Create a test pool with mock tokens');
    console.log('3. Test swaps between mock tokens');
    console.log('4. Once working, deploy real LST tokens and rate providers');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 