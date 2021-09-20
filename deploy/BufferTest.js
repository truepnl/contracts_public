module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const testerAcc = "0x70f53670045EC5B0C8E90EbB7006F8C4E578d8CC";

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

  const tokenArgs = [BigInt(100000000000000000000000 * 10 ** 18).toString()];

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
  const hour = day / 24;
  const min = hour / 60;
  const pt30 = (30 * 1e18).toString();
  const pt8 = (8.333333333333333 * 1e18).toString();

  // Interface:
  // address _paymentToken,
  // address _poolToken,
  // uint256 _startDate,
  // uint256 _closeDate,
  // uint256 _initialUnlock,
  // uint256 _unlockPeriod,
  // uint256 _totalUnlock,
  // uint256 _cliff,
  // uint256 _unlockPerPeriod

  const args = [
    USDT.address,
    USDT.address,
    "1632137788",
    "1632137789",
    pt30,
    3 * min,
    180 * min,
    5 * min,
    pt8,
  ];

  const vestedPool = await deploy("BufferPool", {
    from: deployer,
    args: args,
    log: true,
  });

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  await sleep(10000);

  // await tryVerify(vestedPool.address, args, "contracts/Pools/TPOOL.sol:TPOOL");

  //dev info
  const usdt = await ethers.getContract("USDT", deployer);
  const pool = await ethers.getContract("BufferPool", deployer);

  await usdt.transfer(testerAcc, BigInt(1e18 * 10000));
  await usdt.transfer(vestedPool.address, BigInt(1e18 * 10000));
  await pool.batchSetBuyData([testerAcc], [BigInt(1e18 * 10000)], 11);
};

module.exports.tags = ["BufferTest"];
