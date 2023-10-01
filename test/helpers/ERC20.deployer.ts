const { constants } = require('@openzeppelin/test-helpers');
import { ethers } from 'hardhat';
import { expect } from 'chai';
const ERC20Deployer = async () => {
  let CAP_TOKEN = 10_000_000;
  let REWARDS_TOKEN = 5;
  const ERC20_factory = await ethers.getContractFactory('ERC20Token');
  const deployedERC20 = await ERC20_factory.deploy(CAP_TOKEN, REWARDS_TOKEN);

  expect(await deployedERC20.getAddress()).to.not.equal(constants.ZERO_ADDRESS);

  return { deployedERC20 };
};

export default ERC20Deployer;
