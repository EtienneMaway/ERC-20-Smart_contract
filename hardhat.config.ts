import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

const infuraSepoliaApi = process.env.INFURA_SEPOLIA_API;
const privateKey = process.env.PRIVATE_KEY;

if (!infuraSepoliaApi) {
  throw new Error('INFURA_SEPOLIA_API environment variable not set');
}

if (!privateKey) {
  throw new Error('PRIVATE_KEY environment variable not set');
}

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  networks: {
    sepolia: {
      url: infuraSepoliaApi,
      accounts: [privateKey],
    },
  },
};

export default config;
