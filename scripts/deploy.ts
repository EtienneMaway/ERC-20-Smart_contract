import { ethers } from 'hardhat';

async function main() {
  // Constants for ERC20 token properties
  const NAME = 'Master Coin';
  const SYMBOL = 'MCN';
  let DECIMALS = 18;
  let INITIAL_SUPPLY = 70_000_000;

  // Getting the contract and deploying
  const ERC20_factory = await ethers.getContractFactory('ERC20Token');
  const deployedERC20 = await ERC20_factory.deploy(
    NAME,
    SYMBOL,
    DECIMALS,
    INITIAL_SUPPLY
  );

  await deployedERC20.waitForDeployment();

  // logs the contract address to the console
  console.log(
    'ERC20Token deployed address: ',
    await deployedERC20.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
