const { ethers } = require("hardhat");
const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const USDT = "0x55d398326f99059ff775485246999027b3197955";

  const day = 86400;
  const hour = day / 24;
  const pt50 = (50 * 1e18).toString();
  const goal = BigInt(50000 * 1e18).toString();

  const args = [
    USDT, // address _paymentToken,
    USDT, // address _poolToken,
    "1634216400", // 	Thu Oct 14 2021 13:00:00 GMT+0000
    "1634241600", // Thu Oct 14 2021 20:00:00 GMT+0000
    goal, //50k
    pt50, // uint256 _initialUnlock,
    30 * day, //uint25e6 _unlockPeriod,
    2592000, // uint256 _totalUnlock,
    0, // uint256 _cliff,
    432000, // uint256 _afterPurchaseCliff,
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
};

module.exports.tags = ["SHOEFYProd"];
