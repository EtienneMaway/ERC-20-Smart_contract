import { ethers } from 'hardhat';
import { ERC20Token } from '../typechain-types';

async function main() {
  const ERC20_factory = await ethers.getContractFactory('ERC20Token');
  const deployedERC20 = await ERC20_factory.deploy(10_000_000, 5);

  await deployedERC20.waitForDeployment();

  console.log(
    'ERC20Token deployed address: ',
    await deployedERC20.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
