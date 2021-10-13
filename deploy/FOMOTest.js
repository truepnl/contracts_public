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
    log: true,
  });
  await tryVerify(poolToken.address, tokenArgs);

  await tryVerify(
    USDT.address,
    tokenArgs,
    "contracts/utils/dummyUSDT.sol:USDT"
  );

  const day = 86400;
  const hour = day / 24;
  const min = hour / 60;
  const pt20 = (20 * 1e18).toString();
  const pt10 = (10 * 1e18).toString();

  const args = [
    USDT.address, // address _paymentToken,
    poolToken.address, // address _poolToken,
    Math.round(Date.now() / 1000), // uint256 _startDate,
    Math.round(Date.now() / 1000) + 10 * 8 * min, // uint256 _closeDate,
    pt20, // uint256 _initialUnlock,
    5 * min, //uint256 _unlockPeriod,
    min * 10 * 8, // uint256 _totalUnlock,
    0, // uint256 _cliff,
    8 * min, // uint256 _afterPurchaseCliff,
    pt10, // uint256 _unlockPerPeriod
  ];

  const vestedPool = await deploy("VestedPool", {
    from: deployer,
    args: args,
    log: true,
  });

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  await sleep(10000);

  await tryVerify(vestedPool.address, args);

  await sleep(10000);

  //dev info
  const usdt = await ethers.getContract("USDT", deployer);
  const pool = await ethers.getContract("VestedPool", deployer);
  const token = await ethers.getContract("dummyPoolToken", deployer);

  await usdt.transfer(testerAcc, BigInt(1e18 * 10000));
  await usdt.approve(vestedPool.address, BigInt(1e18 * 400000));
  await token.transfer(vestedPool.address, BigInt(1e18 * 400000));
  await pool.setAllocation(testerAcc, BigInt(1e18 * 10000), 5);
};

module.exports.tags = ["FOMOTest"];
