import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe("ERC20-SMART-CONTRACT", ()=> {
    const NAME = "Master Coin";
    const SYMBOL = "MCN";
    let DECIMALS = 18;
    let INITIAL_SUPPLY = 70_000_000; 
    let TOTAL_SUPPLY = INITIAL_SUPPLY * 10 ** DECIMALS;

  async function deployERC20Fixture() {
    const [ owner, james, alice, otherAccount ] = await ethers.getSigners()

    const ERC20_factory = await ethers.getContractFactory("ERC20");
    const deployedERC20 = await ERC20_factory.deploy(
			NAME,
			SYMBOL,
			DECIMALS,
			INITIAL_SUPPLY 
		);

    return { deployedERC20, owner, james, alice, otherAccount };
  }

  describe("Deployment",() => {
    describe("failure", async () => {
      // We deploy again the contract at this point 
      // with the invalid values to expect failure
      it("should fail if initial supply is lesser than or equal to 0", async () => {
        const ERC20_factory = await ethers.getContractFactory("ERC20");
        await expect(
          ERC20_factory.deploy(NAME, SYMBOL, DECIMALS, 0)
        ).to.be.revertedWith("Initial supply must be positive");
      });

      it("should fail if decimals are lesser than or equal to 0", async () => {
        const ERC20_factory = await ethers.getContractFactory("ERC20");
        await expect(
          ERC20_factory.deploy(NAME, SYMBOL, 0, INITIAL_SUPPLY)
        ).to.be.revertedWith("The decimals must be positive");
      });
    });
    describe("success", async () => {
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

      it("should set the correct owner", async () => {
        const { deployedERC20, owner} = await loadFixture(deployERC20Fixture);

        expect(await deployedERC20.owner()).to.equal(owner.address)
      })
    })
  })

  describe("Transfer Function", async () => {
    describe("failure", async () => {
      it("should fail if transferring to the zero address", async () => {
        const {deployedERC20, owner} = await loadFixture(deployERC20Fixture);
        const zeroAddress = "0x0000000000000000000000000000000000000000";
        const tokenValue = 100;

        await expect(
					deployedERC20.connect(owner).transfer(zeroAddress, tokenValue)
				).to.be.revertedWith("Invalid address");
      })

      it("should fail if transferring more than the sender's balance", async () => {
        const {deployedERC20 , owner, otherAccount} = await loadFixture(deployERC20Fixture);

        await expect(deployedERC20.connect(otherAccount).transfer(owner, 1)).to.be.revertedWith("Insufficient balance");
      });
    })
    describe("success", async () => {
      it("should transfer tokens successfully", async () => {
        const {deployedERC20, owner, otherAccount} = await loadFixture(deployERC20Fixture);

        const inititialOwnerBalance = await deployedERC20.balanceOf(owner);
        const value = BigInt(10000000 * (10 ** DECIMALS));
        const initialOtherAccountBalance = await deployedERC20.balanceOf(otherAccount)
        

        await deployedERC20
					.connect(owner)
					.transfer(otherAccount, value);
        expect(await deployedERC20.balanceOf(owner)).to.be.equal(
              inititialOwnerBalance - value
				);
        
        expect(await deployedERC20.balanceOf(otherAccount)).to.be.equal(
					initialOtherAccountBalance + value
				);
      })

      it("should emit the Transfer event", async () => {
        const {deployedERC20, owner, otherAccount} = await loadFixture(deployERC20Fixture);

				const value = BigInt(10000 * 10 ** DECIMALS);

				expect(
					await deployedERC20.connect(owner).transfer(otherAccount, value)
				).to.emit(deployedERC20, "Transfer").withArgs(owner, otherAccount, value);
      })
    })
  })

  describe("Approve function", () => {
    describe("failure", async () => {
      it("should return boolean: false", async () => {
        // When not approved, getAllowance() returns false
				const { deployedERC20, owner, otherAccount } = await loadFixture(
					deployERC20Fixture
				);

				expect(
					await deployedERC20.getAllowance(owner, otherAccount)
				).to.be.equal(false);
			});
    })
    describe("success", async () => {
      it("should return 'true'", async () => {
        // Here, the owner designated otherAccount to spend token on their behal,
        // getAllowance() will return true
				const { deployedERC20, owner, otherAccount } = await loadFixture(
					deployERC20Fixture
				);

				await deployedERC20
					.connect(owner)
					.approve(otherAccount, BigInt(10_000_000));

				expect(
					await deployedERC20.getAllowance(owner, otherAccount)
				).to.be.equal(true);
			});
    })
  })

  describe("transferFrom function", () => {
    describe('failure', async () => {
      it("should fail if the holder and receiver addresses are zero", async() => {
          const {deployedERC20, otherAccount} = await loadFixture(deployERC20Fixture);

          const holderAddress = "0x0000000000000000000000000000000000000000";
          const receiverAddress = "0x0000000000000000000000000000000000000000";
          
          await expect(
						deployedERC20
							.connect(otherAccount)
							.tranferFrom(holderAddress, receiverAddress, 5000000)
					).to.be.revertedWith("Invalid addresses");
      })
      it("should fail if the transfering more than the holder's balance", async() => {
        const { deployedERC20, james, alice, otherAccount } = await loadFixture(
						deployERC20Fixture
					);

          await expect(
						deployedERC20.connect(james).tranferFrom(alice, otherAccount, 1)
					).to.be.revertedWith("Insufficient balance from the token owner");
      })
      
      it("should fail if transfering more than the allowance", async() => {
        const { deployedERC20, owner, james, alice } =
					await loadFixture(deployERC20Fixture);

					await expect(
						deployedERC20.connect(james).tranferFrom(owner, alice, 501)
					).to.be.revertedWith("Allowance exceeded");
      })
    })

    describe("success", () => {
      it("should transfer the funds", async () => {
        const {deployedERC20, owner, james, alice} = await loadFixture(deployERC20Fixture);

        const initialOwnerBal = await deployedERC20.balanceOf(owner.address);
        const value = BigInt(4_500_000);
        const initialJamesBal = await deployedERC20.balanceOf(james.address);

        await deployedERC20.connect(owner).approve(alice, value);
        await deployedERC20.connect(alice).tranferFrom(owner, james, value);

        expect(await deployedERC20.balanceOf(owner)).to.be.equal(
					initialOwnerBal - value
				);
        expect(await deployedERC20.balanceOf(james)).to.be.equal(
					initialJamesBal + value
				);
      })

      it("should emit the approve Event", async () => {
      const {deployedERC20, owner, james, alice} = await loadFixture(deployERC20Fixture);

      const value = BigInt(500);

			await deployedERC20.connect(owner).approve(alice, value);
			expect(
        await deployedERC20.connect(alice).tranferFrom(owner, james, value)
        ).to.emit(deployedERC20, "Approve").withArgs(owner, james, value);
    })
    })
  })
})
