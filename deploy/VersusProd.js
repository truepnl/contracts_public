const { ethers } = require("hardhat");
const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const USDT = "0x55d398326f99059ff775485246999027b3197955";

  const day = 86400;
  const hour = day / 24;
  const min = hour / 60;
  const pt20 = (20 * 1e18).toString();
  const pt40 = (40 * 1e18).toString();
  const goal = BigInt(18100 * 1e18).toString();

  const args = [
    USDT, // address _paymentToken,
    USDT, // address _poolToken,
    "1634914800", // 	Fri Oct 22 2021 12:00:00 GMT+0000
    "1635019200", // 	Sat Oct 23 2021 12:00:00 GMT+0000
    goal,
    pt20, // uint256 _initialUnlock,
    30 * day, //uint256 _unlockPeriod,
    5998500, // uint256 _totalUnlock,
    30 * day, // uint256 _cliff,
    30 * day, // uint256 _afterPurchaseCliff,
    pt40, // uint256 _unlockPerPeriod
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
};

module.exports.tags = ["VersusProd"];
