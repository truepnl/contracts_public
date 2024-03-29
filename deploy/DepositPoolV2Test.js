module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const testerAcc = process.env.TESTER;

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

  const tokenArgs = [BigInt(10000000000000000000000 * 10 ** 18).toString()];

  const USDT = await deploy("USDT", {
    from: deployer,
    args: tokenArgs,
    log: true,
  });

  await tryVerify(
    USDT.address,
    tokenArgs,
    "contracts/utils/dummyUSDT.sol:USDT"
  );

  const day = 86400;
  const args = [
    USDT.address,
    Math.floor(Date.now() / 1000) - day,
    Math.floor(Date.now() / 1000) - day + 1,
    BigInt(50000 * 10 ** 18).toString(),
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

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  await sleep(10000);

  //dev info
  const usdt = await ethers.getContract("USDT", deployer);
  const pool = await ethers.getContract("DepositPoolV2", deployer);

  await usdt.transfer(testerAcc, BigInt(1e18 * 10000));
  await usdt.approve(depositPool.address, BigInt(1e18 * 400000));

  await pool.batchSetWhitelist([testerAcc], [BigInt(1e18 * 1490)], true);
};

module.exports.tags = ["DepositPoolV2Test"];
