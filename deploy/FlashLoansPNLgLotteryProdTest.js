const { ethers } = require("hardhat");
const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const testerAcc = "0x70f53670045EC5B0C8E90EbB7006F8C4E578d8CC";

  const tokenArgs = [BigInt(10000000000000000000000 * 10 ** 18).toString()];

  const USDT = await deploy("USDT", {
    from: deployer,
    args: tokenArgs,
    log: true,
  });

  const poolToken = await deploy("dummyPoolToken", {
    from: deployer,
    args: tokenArgs,
  });

  const day = 86400;
  const hour = day / 24;
  const min = hour / 60;
  const pt20 = (20 * 1e18).toString();
  const pt10 = (10 * 1e18).toString();
  const goal = BigInt(10000 * 1e18).toString();

  const args = [
    USDT.address, // address _paymentToken,
    USDT.address, // address _poolToken,
    "1635332671", // 	Wed Oct 27 2021 16:00:00 GMT+0000
    "1635361200", // Wed Oct 27 2021 19:00:00 GMT+0000
    goal,
    pt20, // uint256 _initialUnlock,
    30 * day, //uint256 _unlockPeriod,
    5998500, // uint256 _totalUnlock,
    7 * day, // uint256 _cliff,
    456929, // uint256 _afterPurchaseCliff,
    pt20, // uint256 _unlockPerPeriod
  ];

  const vestedPool = await deploy("VestedPool", {
    from: deployer,
    args: args,
    log: true,
  });

  //dev info
  const usdt = await ethers.getContract("USDT", deployer);
  const pool = await ethers.getContract("VestedPool", deployer);
  const token = await ethers.getContract("dummyPoolToken", deployer);

  await usdt.transfer(testerAcc, BigInt(1e18 * 10000));
  await usdt.approve(vestedPool.address, BigInt(1e18 * 400000));
  await token.transfer(vestedPool.address, BigInt(1e18 * 400000));
  await pool.setAllocation(testerAcc, BigInt(1e18 * 10000), 5);
};

module.exports.tags = ["FlashTest"];
