const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const testerAcc = process.env.TESTER;

  const tokenArgs = [BigInt(10000000000000000000000 * 10 ** 18).toString()];

  await deploy("dummyPoolToken", {
    from: deployer,
    args: tokenArgs,
    log: true,
  });

  const token = await ethers.getContract("dummyPoolToken", deployer);

  await deploy("PNLStacking", {
    from: deployer,
    args: [token.address],
    log: true,
  });
  const stacking = await ethers.getContract("PNLStacking", deployer);

  await token.transfer(stacking.address, BigInt(100000000 * 10 ** 18));
  await token.transfer(testerAcc, BigInt(50000 * 10 ** 18));
  await token.transfer(deployer, BigInt(50000 * 10 ** 18));
  await token.approve(stacking.address, BigInt(10000000000 * 10 ** 18));
  await stacking.stack(BigInt(1000 * 10 ** 18), 0);
  await stacking.stack(BigInt(1000 * 10 ** 18), 1);
  await stacking.stack(BigInt(1000 * 10 ** 18), 2);
  await stacking.stack(BigInt(1000 * 10 ** 18), 3);
  await stacking.stack(BigInt(1000 * 10 ** 18), 0);
  await tryVerify(stacking.address, [token.address]);
  await tryVerify(token.address, tokenArgs);

  console.log(`Stacking address: ${stacking.address}`);
  console.log(`Token address: ${token.address}`);
};

module.exports.tags = ["StackingTest"];
