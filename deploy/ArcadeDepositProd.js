const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const USDT = "0x55d398326f99059ff775485246999027b3197955";

  const args = [
    USDT,
    1635434929, // Thu Oct 28 2021 15:28:49 GMT+0000
    1638113329, //	Sat Oct 16 2021 15:00:00 GMT+0000
    BigInt(75000 * 10 ** 18).toString(),
  ];

  const depositPool = await deploy("DepositPoolV2", {
    from: deployer,
    args: args,
    log: true,
  });

  await tryVerify(
    depositPool.address,
    args,
    "contracts/Pools/DepositPoolV2.sol:DepositPoolV2"
  );
};

module.exports.tags = ["ArcadeProd"];
