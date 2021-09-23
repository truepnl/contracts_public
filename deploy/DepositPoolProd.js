module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const day = 86400;
  const hour = day / 24;

  const USDT = "0x55d398326f99059ff775485246999027b3197955";

  const args = [
    USDT,
    1631808000,
    1632067200,
    BigInt(50000 * 10 ** 18).toString(),
  ];

  const depositPool = await deploy("DepositPool", {
    from: deployer,
    args: args,
    log: true,
  });
};

module.exports.tags = ["DepositPoolProd"];
