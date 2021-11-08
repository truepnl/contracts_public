const { ethers } = require("hardhat");
const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const USDT = "0x55d398326f99059ff775485246999027b3197955";
  const FLASH = "0x5f0366c9962193fa774cdce9602195593b49f23c";

  const day = 86400;
  const hour = day / 24;
  const min = hour / 60;
  const pt15 = (15 * 1e18).toString();
  const pt10 = (10.62 * 1e18).toString();
  const goal = 0;

  const args = [
    USDT, // address _paymentToken,
    FLASH, // address _poolToken,
    "1635775200", // 		Mon Nov 01 2021 14:00:00 GMT+0000
    "1635796800", // Mon Nov 01 2021 20:00:00 GMT+0000
    goal,
    pt15, // uint256 _initialUnlock,
    30 * day, //uint256 _unlockPeriod,
    240 * day, // uint256 _totalUnlock,
    0, // uint256 _cliff,
    0, // uint256 _afterPurchaseCliff,
    pt10, // uint256 _unlockPerPeriod
  ];

  const vestedPool = await deploy("VestedPool", {
    from: deployer,
    args: args,
    log: true,
  });

  await new Promise((resolve) => setTimeout(resolve, 10000));
  await tryVerify(vestedPool.address, args);
};

module.exports.tags = ["FlashLoansVestedProd"];
