const { ethers } = require("hardhat");
const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const testerAcc = "0x70f53670045EC5B0C8E90EbB7006F8C4E578d8CC";
  const USDT = "0x55d398326f99059ff775485246999027b3197955";

  const day = 86400;
  const hour = day / 24;
  const min = hour / 60;
  const pt50 = (50 * 1e18).toString();
  const goal = BigInt(50000 * 1e18).toString();

  const args = [
    USDT, // address _paymentToken,
    USDT, // address _poolToken,
    "1634216400", // 	Thu Oct 14 2021 13:00:00 GMT+0000
    "1634241600", // Thu Oct 14 2021 20:00:00 GMT+0000
    goal, //50k
    pt50, // uint256 _initialUnlock,
    10 * min, //uint25e6 _unlockPeriod,
    10 * min, // uint256 _totalUnlock,
    0, // uint256 _cliff,
    428100, // uint256 _afterPurchaseCliff,
    pt50, // uint256 _unlockPerPeriod
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

  //dev info
  const pool = await ethers.getContract("VestedPool", deployer);
  const token = await ethers.getContract("dummyPoolToken", deployer);
  await token.transfer(vestedPool.address, BigInt(1e18 * 400000));

  await pool.batchSetBuyData(
    [testerAcc],
    [BigInt(1e18 * 10000)],
    [0],
    [0],
    400
  );
};

module.exports.tags = ["ShoefyTest"];
