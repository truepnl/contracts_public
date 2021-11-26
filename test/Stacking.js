const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");

describe("Vested Pool Tests", function () {
  let token, stacking;
  let decimals = 18;
  let snapshot;
  const t = (tkn) => BigInt(tkn * 10 ** decimals);
  const c = (arg) => console.log(arg);
  const day = 60 * 60 * 24;
  let deployer, a1, a2, a3, a4, a5, a6, a7, a8;

  before("Deploy", async function () {
    snapshot = await ethers.provider.send("evm_snapshot");
    [deployer, a1, a2, a3, a4, a5, a6, a7, a8] = await ethers.getSigners();

    const stackingF = await ethers.getContractFactory("PNLStacking");
    const tokenF = await ethers.getContractFactory("dummyPoolToken");

    token = await tokenF.deploy(t(1000000));
    stacking = await stackingF.deploy(token.address);
  });

  it("user a1 stackes tokens", async function () {
    await token.transfer(a1.address, t(3000));

    const stacking_a1 = stacking.connect(a1);
    await token.connect(a1).approve(stacking.address, t(10000));

    expect(await stacking.stackingID()).to.eq(0);
    expect(await stacking.getStackesCount(a1.address)).to.eq(0);
    expect(stacking_a1.unstack(0)).to.be.revertedWith(
      "Stacking data isnt found"
    );

    await stacking_a1.stack(t(1000), 0);
    await stacking_a1.stack(t(1000), 2);
    await stacking_a1.stack(t(1000), 0);

    expect(await stacking.stackedAmount()).to.eq(t(3000));
    expect(await stacking.getStackesCount(a1.address)).to.eq(3);
    expect(await stacking.getStackOwner(1)).to.eq(a1.address);

    await expect(stacking_a1.unstack(0)).to.be.revertedWith(
      "Too early to withdraw"
    );

    //let's check what happens 89 days after
    await ethers.provider.send("evm_increaseTime", [day * 89]);
    //still can't withdraw
    await expect(stacking_a1.unstack(0)).to.be.revertedWith(
      "Too early to withdraw"
    );

    //make withdrawal possible
    await ethers.provider.send("evm_increaseTime", [2 * day]);
    await expect(stacking_a1.unstack(0)).not.to.be.reverted;
    await expect(stacking_a1.unstack(0)).to.be.revertedWith(
      "Already withdrawn"
    );
    expect(await stacking.stackedAmount()).to.eq(t(2000));

    // 1000 tokens with 2% APY for 91 days yield roughly 4.93150685
    expect(await stacking.paidAmount()).to.eq("1004986301369863013698");
    expect(await token.balanceOf(a1.address)).to.eq("1004986301369863013698");

    // let's check the 1yr investment
    await expect(stacking_a1.unstack(1)).to.be.revertedWith(
      "Too early to withdraw"
    );
    await ethers.provider.send("evm_increaseTime", [day * 200]);
    await expect(stacking_a1.unstack(1)).to.be.revertedWith(
      "Too early to withdraw"
    );
    await ethers.provider.send("evm_increaseTime", [day * 76]);
    await expect(stacking_a1.unstack(1)).not.to.be.reverted;

    // 100 tokens with 4% APY for 365 days yield roughly 4 tokens
    expect(await stacking.paidAmount()).to.eq("2044986301369863013698");
    expect(await token.balanceOf(a1.address)).to.eq("2044986301369863013698");
  });
});
