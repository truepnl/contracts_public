const { ethers } = require("hardhat");
const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const USDT = "0x55d398326f99059ff775485246999027b3197955";
  const OTAKU = "0x484215873a674f9af73367a8f94c2c591e997521";

  const day = 86400;
  const hour = day / 24;
  const min = hour / 60;
  const pt20 = (20 * 1e18).toString();
  const pt40 = (40 * 1e18).toString();
  const goal = BigInt(50000 * 1e18).toString();

  const args = [
    USDT, // address _paymentToken,
    OTAKU, // address _poolToken,
    "1634115600", // 	Wed Oct 13 2021 09:00:00 GMT+0000
    "1640114100", // Tue Dec 21 2021 19:15:00 GMT+0000
    goal,
    pt20, // uint256 _initialUnlock,
    30 * day, //uint256 _unlockPeriod,
    5998500, // uint256 _totalUnlock,
    7 * day, // uint256 _cliff,
    209700, // uint256 _afterPurchaseCliff,
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

module.exports.tags = ["FOMOProd"];
