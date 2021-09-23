const { expect } = require("chai");
const { ethers, deployments, getNamedAccounts } = require("hardhat");

describe("Vested Pool Tests", function () {
  let token, USDT, pool;
  let participants;
  let decimals = 18;
  let snapshot;
  const t = (tkn) => BigInt(tkn * 10 ** decimals);
  const c = (arg) => console.log(arg);
  let deployer, a1, a2, a3, a4, a5, a6, a7, a8;

  before("Deploy", async function () {
    snapshot = await ethers.provider.send("evm_snapshot");
    [deployer, a1, a2, a3, a4, a5, a6, a7, a8] = await ethers.getSigners();
    participants = [a1, a2, a3, a4, a5, a6];
    const MAX = BigInt(2 ** 255);

    await deployments.fixture(["VestedPool"], deployer);
    token = await ethers.getContract("dummyPoolToken", deployer);
    USDT = await ethers.getContract("USDT", deployer);
    pool = await ethers.getContract("VestedPool", deployer);

    for (const participant of participants) {
      await USDT.transfer(participant.address, t(500));
      await USDT.connect(participant).approve(pool.address, MAX);
    }
    await USDT.transfer(a7.address, t(100));
    await USDT.transfer(a8.address, t(500));
  });

  it("User a2 buys tokens for 375 usd and gets allocation", async function () {
    const flooredDecimals = (num) => Math.floor(num / 10 ** decimals);
    const rate = 11;

    await pool.batchSetAllocations(
      [...participants.map((a) => a.address), a7.address],
      t(34090),
      rate
    );

    expect(await USDT.balanceOf(a1.address)).to.equal(t(500));
    expect(await pool.saleActive()).to.equal(true);

    await pool.connect(a2).buy();
    expect(flooredDecimals(await USDT.balanceOf(a2.address))).to.eq(125);
  });
});
