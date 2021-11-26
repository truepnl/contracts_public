module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const testerAcc = process.env.TESTER;

  const tokenArgs = [BigInt(10000000000000000000000 * 10 ** 18).toString()];

  const token = await deploy("dummyPoolToken", {
    from: deployer,
    args: tokenArgs,
    log: true,
  });

  const stacking = await deploy("PNLStacking", {
    from: deployer,
    args: [token.address],
    log: true,
  });

  await token.transfer(stacking.address, BigInt(100000000 * 10 ** 18));
  await token.transfer(testerAcc, BigInt(5000 * 10 ** 18));

  console.log(`Stacking address: ${stacking.address}`);
  console.log(`Token address: ${token.address}`);
};

module.exports.tags = ["StackingTest"];
