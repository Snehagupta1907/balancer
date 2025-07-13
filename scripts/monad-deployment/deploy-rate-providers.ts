/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying rate providers for LST tokens');
  console.log('Account:', deployer.address);

  try {
    console.log('\n=== Deploying LST Rate Providers ===');

    // Deploy rate providers for each LST token
    const MockLSTRateProvider = await ethers.getContractFactory('MockLSTRateProvider');

    // Deploy shMON rate provider (0 = SHMON enum value)
    console.log('\n--- Deploying shMON Rate Provider ---');
    const shMONRateProvider = await MockLSTRateProvider.deploy(0); // SHMON = 0
    await shMONRateProvider.deployed();
    console.log('✅ shMON Rate Provider:', shMONRateProvider.address);
    console.log('Rate:', ethers.utils.formatEther(await shMONRateProvider.getRate()));
    console.log('Description:', await shMONRateProvider.getRateDescription());

    // Deploy sMON rate provider (1 = SMON enum value)
    console.log('\n--- Deploying sMON Rate Provider ---');
    const sMONRateProvider = await MockLSTRateProvider.deploy(1); // SMON = 1
    await sMONRateProvider.deployed();
    console.log('✅ sMON Rate Provider:', sMONRateProvider.address);
    console.log('Rate:', ethers.utils.formatEther(await sMONRateProvider.getRate()));
    console.log('Description:', await sMONRateProvider.getRateDescription());

    // Deploy gMON rate provider (2 = GMON enum value)
    console.log('\n--- Deploying gMON Rate Provider ---');
    const gMONRateProvider = await MockLSTRateProvider.deploy(2); // GMON = 2
    await gMONRateProvider.deployed();
    console.log('✅ gMON Rate Provider:', gMONRateProvider.address);
    console.log('Rate:', ethers.utils.formatEther(await gMONRateProvider.getRate()));
    console.log('Description:', await gMONRateProvider.getRateDescription());

    // Deploy aprMON rate provider (3 = APRMON enum value)
    console.log('\n--- Deploying aprMON Rate Provider ---');
    const aprMONRateProvider = await MockLSTRateProvider.deploy(3); // APRMON = 3
    await aprMONRateProvider.deployed();
    console.log('✅ aprMON Rate Provider:', aprMONRateProvider.address);
    console.log('Rate:', ethers.utils.formatEther(await aprMONRateProvider.getRate()));
    console.log('Description:', await aprMONRateProvider.getRateDescription());

    console.log('\n🎉 === RATE PROVIDERS DEPLOYMENT SUCCESSFUL === 🎉');
    console.log('\n📋 Deployed Rate Providers:');
    console.log('shMON Rate Provider:', shMONRateProvider.address);
    console.log('sMON Rate Provider:', sMONRateProvider.address);
    console.log('gMON Rate Provider:', gMONRateProvider.address);
    console.log('aprMON Rate Provider:', aprMONRateProvider.address);

    console.log('\n📊 Rate Summary:');
    console.log('1 WMON = 0.9842 shMON');
    console.log('1 WMON = 0.9852 sMON');
    console.log('1 WMON = 1.0004 gMON');
    console.log('1 WMON = 0.996 aprMON');

    console.log('\n📝 Next Steps:');
    console.log('1. Update create-lst-stable-pool.ts with these rate provider addresses');
    console.log('2. Deploy the production LST stable pool');
    console.log('3. Test the pool with real rate providers');

  } catch (error) {
    console.error('❌ Rate providers deployment failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 