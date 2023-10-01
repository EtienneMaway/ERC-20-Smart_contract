import { expect, assert } from 'chai';
import { ethers } from 'hardhat';
import { ERC20Token } from '../typechain-types';
import ERC20Deployer from './helpers/ERC20.deployer';
import { Signer } from 'ethers';
describe.only('ERC20Token Test cases', async () => {
  let deployedERC20: ERC20Token;
  let owner: Signer;
  let james: Signer;
  let alice: Signer;
  let otherAccount: Signer;

  // Before hook to set up initial state
  before(async () => {
    // Fetch Ethereum signers
    [owner, james, alice, otherAccount] = await ethers.getSigners();

    ({ deployedERC20 } = await ERC20Deployer());
  });

  it('should set the right owner', async () => {
    const rightOwner = await deployedERC20.owner();
    expect(rightOwner).to.equal(await owner.getAddress());
  });
  it('should set the correct name', async () => {
    const expectedName = 'Master Coin';
    const currentName = await deployedERC20.name();

    assert(currentName === expectedName, 'names should be equal');
  });

  it('should set the correct Symbol', async () => {
    const expectedSymbol = 'MCN';
    const currentSymbol = await deployedERC20.symbol();

    assert(currentSymbol === expectedSymbol, 'symbols should be identical');
  });
  it('should set the correct token mint limit', async () => {
    const expectedCap = 10_000_000 * 10 ** 18;
    const tokenMintLimit = Number(await deployedERC20.cap());

    assert(
      expectedCap === tokenMintLimit,
      "'expectedCap' and 'tokenMintLimit' should be equal"
    );
  });

  it('should mint tokens and assign the totalSupply to the owner', async () => {
    const totalSupply = await deployedERC20.totalSupply();
    const ownerBalance = await deployedERC20.balanceOf(
      await owner.getAddress()
    );
    assert(
      totalSupply === ownerBalance,
      'totalSupply should be equal to ownerBalance'
    );
  });

  it('should set the correct block reward', async () => {
    const expectedBlockReward = BigInt(5 * 10 ** 18);
    const blockReward = await deployedERC20.blockReward();
    expect(blockReward).to.equal(expectedBlockReward);
  });

  it('should update the block reward only by the owner', async () => {
    const newBlockReward = BigInt(7 * 10 ** 18);

    await expect(
      deployedERC20.connect(james).setBlockReward(newBlockReward)
    ).to.be.revertedWith("You're not authorized");

    await deployedERC20.connect(owner).setBlockReward(newBlockReward);

    expect(await deployedERC20.blockReward()).to.equal(newBlockReward);
  });

  it('should transfer tokens successfully from account1 to account2', async () => {
    const initialOwnerBal = await deployedERC20.balanceOf(owner);
    const initialJamesBal = await deployedERC20.balanceOf(james);
    const value = BigInt(100_000 * 10 ** 18);

    await deployedERC20.connect(owner).transfer(james, value);
    expect(await deployedERC20.balanceOf(james)).to.equal(
      initialJamesBal + value
    );
    expect(await deployedERC20.balanceOf(owner)).to.equal(
      initialOwnerBal - value
    );

    const currentJamesBal = initialJamesBal + value;
    await deployedERC20.connect(james).transfer(alice, currentJamesBal);
    expect(await deployedERC20.balanceOf(james)).to.equal(0);
    expect(await deployedERC20.balanceOf(alice)).to.equal(currentJamesBal);
  });

  it("should fail if transferring more than the sender's balance", async () => {
    await expect(
      deployedERC20.connect(james).transfer(owner, 1)
    ).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  });
  it('should fail if transferring tokens to a Zero account', async () => {
    const zeroAccount = '0x0000000000000000000000000000000000000000';

    await expect(
      deployedERC20.connect(owner).transfer(zeroAccount, 1)
    ).to.be.revertedWith('ERC20: transfer to the zero address');
  });

  it('should emit Transfer event', async () => {
    const value = BigInt(50_000 * 10 ** 18);

    expect(await deployedERC20.connect(owner).transfer(alice, value))
      .emit(deployedERC20, 'Transfer')
      .withArgs(owner, james, value);
  });

  it("should approve the designated valid account and return 'true'", async () => {
    const value = BigInt(50_000 * 10 ** 18);

    await deployedERC20.connect(owner).approve(james, value);
    expect((await deployedERC20.allowance(owner, james)) > 0).to.be.true;
  });

  it('should emit Approve event', async () => {
    expect(await deployedERC20.connect(owner).approve(james, 1000))
      .to.emit(deployedERC20, 'Approve')
      .withArgs(owner, james, 1000);
  });

  it('should fail to approve a Zero account', async () => {
    const value = BigInt(500_000 * 10 ** 18);
    const zeroAccount = '0x0000000000000000000000000000000000000000';

    await expect(
      deployedERC20.connect(owner).approve(zeroAccount, value)
    ).to.be.revertedWith('ERC20: approve to the zero address');
  });

  it('should tranfer the allowance successfully', async () => {
    const value = BigInt(50_000 * 10 ** 18);

    const innitalAliceBal = await deployedERC20.balanceOf(alice);

    await deployedERC20.connect(owner).approve(james, value);

    await deployedERC20.connect(james).transferFrom(owner, alice, value);

    expect(await deployedERC20.balanceOf(alice)).to.equal(
      innitalAliceBal + value
    );
    expect(await deployedERC20.allowance(owner, james)).to.equal(0);
  });

  it('should fail if the receiver has zero accounts ', async () => {
    const value = BigInt(5_000 * 10 ** 18);
    const receiver = '0x0000000000000000000000000000000000000000';

    await deployedERC20.connect(owner).approve(james, value);
    await expect(
      deployedERC20.connect(james).transferFrom(owner, receiver, value)
    ).to.be.revertedWith('ERC20: transfer to the zero address');
  });

  it('should fail if tranfering more than the allowance', async () => {
    const value = 2000;

    await deployedERC20.connect(owner).approve(james, value);
    await expect(
      deployedERC20.connect(james).transferFrom(owner, alice, 2001)
    ).to.be.revertedWith('ERC20: insufficient allowance');
  });
});
