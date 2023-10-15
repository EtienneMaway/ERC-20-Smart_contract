import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect, assert } from 'chai';
import { ethers } from 'hardhat';

// Test suite for the ERC20Token smart contract
describe('ERC20-SMART-CONTRACT', () => {
  // Constants for ERC20 token properties
  const NAME = 'Master Coin';
  const SYMBOL = 'MCN';
  let DECIMALS = 18;
  let INITIAL_SUPPLY = 70_000_000;
  let TOTAL_SUPPLY = INITIAL_SUPPLY * 10 ** DECIMALS;

  // Fixture function to deploy the ERC20Token contract and get signers
  async function deployERC20Fixture() {
    const [owner, james, alice, otherAccount] = await ethers.getSigners();

    const ERC20_factory = await ethers.getContractFactory('ERC20Token');
    const deployedERC20 = await ERC20_factory.deploy(
      NAME,
      SYMBOL,
      DECIMALS,
      INITIAL_SUPPLY
    );

    return { deployedERC20, owner, james, alice, otherAccount };
  }

  // Test to ensure the contract sets the correct name
  it('Should set the correct name', async () => {
    const { deployedERC20 } = await loadFixture(deployERC20Fixture);

    const expectedName = 'Master Coin';
    const actualName = await deployedERC20.name();

    assert(expectedName === actualName, "names don't match");
  });

  // Test to ensure the contract sets the correct symbol
  it('Should have the correct Symbol', async () => {
    const { deployedERC20 } = await loadFixture(deployERC20Fixture);

    const expectedSymbol = 'MCN';
    const actualSymbol = await deployedERC20.symbol();

    assert(expectedSymbol === actualSymbol, "Symbols don't match");
  });

  // Test to ensure correct ownership of the contract
  it('should set the right owner', async () => {
    const { deployedERC20, owner } = await loadFixture(deployERC20Fixture);
    expect(await deployedERC20.owner()).to.equal(owner.address);
  });

  // Test to verify token transfer between accounts
  it('should transfer token between accounts', async () => {
    const { deployedERC20, owner, otherAccount } =
      await loadFixture(deployERC20Fixture);

    const inititialOwnerBalance = await deployedERC20.balanceOf(owner);
    const value = BigInt(10000000 * 10 ** DECIMALS);
    const initialOtherAccountBalance =
      await deployedERC20.balanceOf(otherAccount);

    await deployedERC20.connect(owner).transfer(otherAccount, value);
    expect(await deployedERC20.balanceOf(owner)).to.be.equal(
      inititialOwnerBalance - value
    );

    expect(await deployedERC20.balanceOf(otherAccount)).to.be.equal(
      initialOtherAccountBalance + value
    );
  });

  // Test to ensure the Transfer event is emitted during a token transfer
  it('should emit the Transfer event', async () => {
    const { deployedERC20, owner, otherAccount } =
      await loadFixture(deployERC20Fixture);

    const value = BigInt(10000 * 10 ** DECIMALS);

    expect(await deployedERC20.connect(owner).transfer(otherAccount, value))
      .to.emit(deployedERC20, 'Transfer')
      .withArgs(owner, otherAccount, value);
  });

  // Test to verify failure when transferring tokens to a zero address
  it('should fail if transfering to a zero address', async () => {
    const { deployedERC20, owner } = await loadFixture(deployERC20Fixture);
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const tokenValue = 100;

    await expect(
      deployedERC20.connect(owner).transfer(zeroAddress, tokenValue)
    ).to.be.revertedWith('Invalid address');
  });

  // Test to ensure the approval mechanism works as intended
  it("should fail if transfering more than the sender's balance", async () => {
    const { deployedERC20, owner, otherAccount } =
      await loadFixture(deployERC20Fixture);

    await expect(
      deployedERC20.connect(otherAccount).transfer(owner, 1)
    ).to.be.revertedWith('Insufficient balance');
  });

  // One account1 approves random account to spend account1's token
  it('should approve a specified account to spend Token', async () => {
    const { deployedERC20, owner, otherAccount } =
      await loadFixture(deployERC20Fixture);

    // Here, the owner designate "otherAccount" to spend token on their behalf
    await deployedERC20
      .connect(owner)
      .approve(otherAccount, BigInt(10_000_000));

    // assertting that "otherAccount" is allowed to spend owner's token
    expect(await deployedERC20.getAllowance(owner, otherAccount)).to.be.equal(
      true
    );
  });

  it("should fail to spend holder's token if not approved", async () => {
    const { deployedERC20, owner, otherAccount } =
      await loadFixture(deployERC20Fixture);

    // When not approved, getAllowance() returns false
    expect(await deployedERC20.getAllowance(owner, otherAccount)).to.be.equal(
      false
    );
  });

  // Test to verify that spending approved tokens works as expected
  it('should spend the approved token successfully', async () => {
    const { deployedERC20, owner, james, alice } =
      await loadFixture(deployERC20Fixture);

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
  });

  // Test to verify that the Approve event is emitted during an approval
  it('should emit the approve Event', async () => {
    const { deployedERC20, owner, james, alice } =
      await loadFixture(deployERC20Fixture);

    const value = BigInt(500);

    await deployedERC20.connect(owner).approve(alice, value);
    expect(await deployedERC20.connect(alice).tranferFrom(owner, james, value))
      .to.emit(deployedERC20, 'Approve')
      .withArgs(owner, james, value);
  });

  // Test to verify failure when spending the allowance to a zero address
  it('should fail to spend the allowance if to account 0', async () => {
    const { deployedERC20, owner, otherAccount } =
      await loadFixture(deployERC20Fixture);

    const receiverAddress = '0x0000000000000000000000000000000000000000';

    await deployedERC20.connect(owner).approve(otherAccount, 500);

    await expect(
      deployedERC20
        .connect(otherAccount)
        .tranferFrom(owner, receiverAddress, 5000000)
    ).to.be.revertedWith('Invalid address');
  });

  // Test to verify failure when spending more than the holder's balance
  it("should fail if the spending more than the holder's balance", async () => {
    const { deployedERC20, james, alice, otherAccount } =
      await loadFixture(deployERC20Fixture);

    await expect(
      deployedERC20.connect(james).tranferFrom(alice, otherAccount, 1)
    ).to.be.revertedWith('Insufficient balance from the token owner');
  });

  // Test to verify failure when spending more than the allowance
  it('should fail if spnding more than the allowance', async () => {
    const { deployedERC20, owner, james, alice } =
      await loadFixture(deployERC20Fixture);

    await expect(
      deployedERC20.connect(james).tranferFrom(owner, alice, 501)
    ).to.be.revertedWith('Allowance exceeded');
  });
});
