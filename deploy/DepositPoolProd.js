module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const tryVerify = async (contract, args, file) => {
    try {
      await run("verify:verify", {
        contract: file,
        address: contract,
        constructorArguments: args,
      });
    } catch (e) {
      console.log(e);
      console.log(`${e.name} - ${e.message}`);
    }
  };

  const day = 86400;
  const hour = day / 24;

  const USDT = "0x55d398326f99059ff775485246999027b3197955";

  const args = [
    USDT,
    1634677200,
    1635627600,
    BigInt(62500 * 10 ** 18).toString(),
  ];

  const depositPool = await deploy("DepositPool", {
    from: deployer,
    args: args,
    log: true,
  });

  await tryVerify(
    depositPool.address,
    args,
    "contracts/Pools/DepositPool.sol:DepositPool"
  );
};

module.exports.tags = ["DepositPoolProd"];
