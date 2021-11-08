const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const USDT = "0x55d398326f99059ff775485246999027b3197955";

  const args = [
    USDT,
    1635768000,
    1638360000,
    BigInt(100000 * 10 ** 18).toString(),
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

module.exports.tags = ["SolcloutDepositPoolProd"];
