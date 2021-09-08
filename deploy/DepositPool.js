module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const tryVerify = async (contract, args) => {
    try {
      await run("verify:verify", {
        address: contract,
        constructorArguments: args,
      });
    } catch (e) {}
  };

  const tokenArgs = [BigInt(10000000000000000000000 * 10 ** 18).toString()];
  const USDT = await deploy("USDT", {
    from: deployer,
    args: tokenArgs,
    log: true,
  });
  await tryVerify(USDT.address, tokenArgs);

  const day = 86400;
  const hour = day / 24;

  const args = [
    USDT.address,
    Date.now(),
    Date.now() + day,
    BigInt(50000 * 10 ** 18),
  ];

  const depositPool = await deploy("DepositPool", {
    from: deployer,
    args: args,
    log: true,
  });
  tryVerify(vestedPool.address, args);
};

module.exports.tags = ["DepositPool"];
