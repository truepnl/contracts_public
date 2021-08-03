module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const testerAcc = "0x5906aB74bb1757eAcB94722249cFe1cE3f003E84";

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

  const poolToken = await deploy("dummyPoolToken", {
    from: deployer,
    args: tokenArgs,
    log: true,
  });

  await tryVerify(
    poolToken.address,
    tokenArgs,
    "contracts/utils/dummyPoolToken.sol:dummyPoolToken"
  );

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
  const pt10 = (1e17).toString();

  const args = [
    USDT.address,
    poolToken.address,
    Date.now(),
    Date.now() + day,
    pt10,
    day,
    day * 9,
    0,
    pt10,
  ];

  const vestedPool = await deploy("VestedPool", {
    from: deployer,
    args: args,
    log: true,
  });

  await tryVerify(
    vestedPool.address,
    args,
    "contracts/Pools/VestedPool.sol:VestedPool"
  );

  //dev info
  const usdt = await ethers.getContract("USDT", deployer);
  const token = await ethers.getContract("dummyPoolToken", deployer);
  const pool = await ethers.getContract("VestedPool", deployer);

  // await usdt.transfer(testerAcc, BigInt(1e18 * 1000));
  await token.transfer(vestedPool.address, BigInt(1e18 * 1000));
  await pool.setAllocation(testerAcc, BigInt(1e18 * 34090), 11);
};

module.exports.tags = ["testDeploy"];
