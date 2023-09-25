import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("ERC20-SMART-CONTRACT", ()=> {
  
  async function deployERC20Fixture() {
    const NAME = "Master Coin";
    const SYMBOL = "MCN";
    let DECIMALS = 9;
    let INITIAL_SUPPLY = 1000000; 
    let TOTAL_SUPPLY = INITIAL_SUPPLY * 10 ** DECIMALS;

    const [ owner, otherAccount ] = await ethers.getSigners()

    const ERC20_factory = await ethers.getContractFactory("ERC20");
    const deployedERC20 = await ERC20_factory.deploy(
			NAME,
			SYMBOL,
			DECIMALS,
			INITIAL_SUPPLY 
		);

    return { deployedERC20, owner, otherAccount };
  }

  describe("Deployment",() => {
    describe("Success", async () => {
      it('Should have the correct name',async ()=>{
        const { deployedERC20 } = await loadFixture(deployERC20Fixture);

        const expectedName = "Master Coin"
        const actualName = await deployedERC20.name()

        assert(expectedName === actualName, "names don't match")
      })
      it('Should have the correct Symbol',async ()=>{
        const { deployedERC20 } = await loadFixture(deployERC20Fixture);

        const expectedSymbol = "MCN";
        const actualSymbol = await deployedERC20.symbol();

        assert(expectedSymbol === actualSymbol, "Symbols don't match")
      })
    })

  })
})
