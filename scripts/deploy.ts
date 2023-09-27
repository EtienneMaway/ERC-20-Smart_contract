import { ethers } from "hardhat";

async function main() {
  
  // const [owner, otherAccount] = ethers.getSigners()

  const ERC20_factory = await ethers.getContractFactory("ERC20");
  const deployedERC20 = await ERC20_factory.deploy("Master Coin", "MCN", 18, 70000000);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
