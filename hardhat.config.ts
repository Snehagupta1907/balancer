/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import "hardhat-dependency-compiler";
import dotenv from 'dotenv';

dotenv.config();

const config: any = {
  solidity: {
    version: '0.7.1',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'istanbul',
    },
  },
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  networks: {
    monad: {
      url: 'https://testnet-rpc.monad.xyz',
      accounts: [process.env.PRIVATE_KEY],
      chainId: 10143,
    },
  },
  dependencyCompiler: {
    paths: [
      "pkg/pool-stable/contracts/ComposableStablePoolFactory.sol",
      "pkg/pool-stable/contracts/ComposableStablePool.sol",
      "pkg/pool-stable/contracts/ComposableStablePoolRates.sol",
      "pkg/pool-stable/contracts/ComposableStablePoolProtocolFees.sol",
      "pkg/standalone-utils/contracts/ProtocolFeePercentagesProvider.sol",
    ],
  },
};

export default config;