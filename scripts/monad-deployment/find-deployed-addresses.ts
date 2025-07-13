/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Finding deployed addresses for LST pool with rate providers');
  console.log('Account:', deployer.address);

  // Known addresses from deploy-core-only.ts
  const VAULT_ADDRESS = '0x598265DC45aDA61227153a96A3d20Ea0Fa198B0E';
  const MOCK_TOKENS = {
    shMON: '0x747ee810C8477F2e85A88ea66A5e03C9494A2cfc',
    sMON: '0xeAB8785e3D2E48E5b24689D7e98c88f91Fd8170D',
    gMON: '0xE04fa707fAcAF0441E5983aCDCB89FfCC457234b',
    aprMON: '0x75714FE9Fc17a84097e6194b3B024716AD5a2be7'
  };

  try {
    console.log('\n=== Checking for deployed rate providers ===');
    
    // Check if rate providers were deployed by looking for recent transactions
    // You'll need to manually check your deployment logs for these addresses
    
    console.log('Please check your deployment logs for these rate provider addresses:');
    console.log('1. shMON Rate Provider');
    console.log('2. sMON Rate Provider'); 
    console.log('3. gMON Rate Provider');
    console.log('4. aprMON Rate Provider');
    
    console.log('\n=== Checking for deployed LST pool ===');
    
    // Check if the LST pool with rates was deployed
    // The pool address should be different from the no-rates pool
    console.log('Please check your deployment logs for the LST pool WITH rate providers address');
    console.log('This should be different from the no-rates pool address');
    
    console.log('\n=== Known Addresses ===');
    console.log('Vault:', VAULT_ADDRESS);
    console.log('Mock shMON:', MOCK_TOKENS.shMON);
    console.log('Mock sMON:', MOCK_TOKENS.sMON);
    console.log('Mock gMON:', MOCK_TOKENS.gMON);
    console.log('Mock aprMON:', MOCK_TOKENS.aprMON);
    
    console.log('\n=== Next Steps ===');
    console.log('1. Find the rate provider addresses from your deployment logs');
    console.log('2. Find the LST pool WITH rates address from your deployment logs');
    console.log('3. Update add-liquidity-lst-with-rates.ts with these addresses');
    console.log('4. Run the liquidity addition script');

  } catch (error) {
    console.error('❌ Error finding addresses:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 