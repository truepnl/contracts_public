module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const tokenArgs = [BigInt(10000000000000000000000 * 10 ** 18).toString()];

  const USDT = "0x55d398326f99059ff775485246999027b3197955";

  const day = 86400;
  const hour = day / 24;
  const min = hour / 60;
  const pt20 = (20 * 1e18).toString();
  const pt10 = (10 * 1e18).toString();

  const args = [
    USDT,
    USDT,
    1629727200,
    1629727200 + 24 * hour,
    pt20,
    16 * min,
    min * 100,
    0,
    pt10,
  ];

  const vestedPool = await deploy("YAYPool", {
    from: deployer,
    args: args,
    log: true,
  });
};

module.exports.tags = ["YAYProd"];
