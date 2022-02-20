import { expect } from "chai";
import { ethers } from "hardhat";

describe("Greeter", function () {
  let tokenETH: any;
  let tokenBSC: any;
  let brigeETH: any;
  let brigeBSC: any;
  let ethBridgeNonce: number = 0;
  let bscBridgeNonce: number = 0;

  let user1: any;

  before(async function () {
    [, user1] = await ethers.getSigners();
    const contractToken = await ethers.getContractFactory("VRNToken");

    tokenETH = await contractToken.deploy();
    await tokenETH.deployed();

    tokenBSC = await contractToken.deploy();
    await tokenBSC.deployed();

    const contractBrige = await ethers.getContractFactory("VRNBrige");

    brigeETH = await contractBrige.deploy(tokenETH.address);
    await brigeETH.deployed();

    await tokenETH.setAdmin(brigeETH.address);

    brigeBSC = await contractBrige.deploy(tokenBSC.address);
    await brigeBSC.deployed();

    await tokenBSC.setAdmin(brigeBSC.address);
  });
  it("Mint tokens", async function () {
    await brigeETH.mint(user1.address, ethers.utils.parseEther("1000.0"));
    const balance = await tokenETH.balanceOf(user1.address);
    expect(ethers.utils.formatEther(balance)).to.equal("1000.0");
  });
  it("Transfer ETH to BSC", async function () {
    const swapAmount = ethers.utils.parseEther("500.0");

    const tx = await brigeETH.connect(user1).swap(swapAmount, ethBridgeNonce);
    ethBridgeNonce++;
    const receipt = await tx.wait();

    const { from, amount, nonce, timestamp } = receipt.events?.find(
      (evt: any) => evt.event === "Swap"
    ).args;

    const signedDataHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256", "uint256"],
      [from, amount, nonce, timestamp]
    );

    const bytesArray = ethers.utils.arrayify(signedDataHash);
    const flatSignature = await user1.signMessage(bytesArray);
    const { v, r, s } = ethers.utils.splitSignature(flatSignature);

    await brigeBSC.redeem(user1.address, amount, nonce, timestamp, v, r, s);

    const newEthBalanse = await tokenETH.balanceOf(user1.address);
    expect(ethers.utils.formatEther(newEthBalanse)).to.equal("500.0");

    const newBscBalanse = await tokenBSC.balanceOf(user1.address);
    expect(newBscBalanse).to.equal(amount);
  });
  it("Transfer BSC to ETH", async function () {
    const swapAmount = ethers.utils.parseEther("250.0");
    const tx = await brigeBSC.connect(user1).swap(swapAmount, bscBridgeNonce);
    bscBridgeNonce++;

    const receipt = await tx.wait();
    const { from, amount, nonce, timestamp } = receipt.events?.find(
      (evt: any) => evt.event === "Swap"
    ).args;

    const signedDataHash = ethers.utils.solidityKeccak256(
      ["address", "uint256", "uint256", "uint256"],
      [from, amount, nonce, timestamp]
    );

    const bytesArray = ethers.utils.arrayify(signedDataHash);
    const flatSignature = await user1.signMessage(bytesArray);
    const { v, r, s } = ethers.utils.splitSignature(flatSignature);

    await brigeETH.redeem(user1.address, amount, nonce, timestamp, v, r, s);

    const newBscBalanse = await tokenBSC.balanceOf(user1.address);
    expect(ethers.utils.formatEther(newBscBalanse)).to.equal("250.0");

    const newEthBalanse = await tokenETH.balanceOf(user1.address);
    expect(ethers.utils.formatEther(newEthBalanse)).to.equal("750.0");
  });
});
