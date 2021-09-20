const { ethers } = require("hardhat");

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

  const tokenArgs = [BigInt(10000000000000000000000 * 10 ** 18).toString()];

  const USDT = await deploy("USDT", {
    from: deployer,
    args: tokenArgs,
    log: true,
  });

  const poolToken = await deploy("dummyPoolToken", {
    from: deployer,
    args: tokenArgs,
    log: true,
  });
  await tryVerify(poolToken.address, tokenArgs);

  await tryVerify(
    USDT.address,
    tokenArgs,
    "contracts/utils/dummyUSDT.sol:USDT"
  );

  const day = 86400;
  const hour = day / 24;
  const min = hour / 60;
  const pt20 = (20 * 1e18).toString();
  const pt10 = (10 * 1e18).toString();

  // Interface:
  // address _paymentToken,
  // address _poolToken,
  // uint256 _startDate,
  // uint256 _closeDate,
  // uint256 _initialUnlock,
  // uint256 _unlockPeriod,
  // uint256 _totalUnlock,
  // uint256 _cliff,
  // uint256 _afterPurchaseCliff,
  // uint256 _unlockPerPeriod

  const args = [
    USDT.address,
    poolToken.address,
    Math.round(Date.now() / 1000),
    Math.round(Date.now() / 1000) + 10 * 9 * min,
    pt20,
    2 * min,
    min * 10 * 9,
    180,
    5 * min,
    pt10,
  ];

  const vestedPool = await deploy("VestedPool", {
    from: deployer,
    args: args,
    log: true,
  });
  await sleep(10000);

  await tryVerify(vestedPool.address, args);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  await sleep(10000);

  //dev info
  const usdt = await ethers.getContract("USDT", deployer);
  const pool = await ethers.getContract("VestedPool", deployer);
  const token = await ethers.getContract("dummyPoolToken", deployer);

  await usdt.transfer(testerAcc, BigInt(1e18 * 10000));
  await usdt.approve(vestedPool.address, BigInt(1e18 * 400000));
  await token.transfer(vestedPool.address, BigInt(1e18 * 400000));

  await pool.setAllocation(testerAcc, BigInt(1e18 * 272727), 5);
  await pool.setAllocation(
    "0x13E02ff1d524A0C2f1A2fF86B4B654A3FAcD7644",
    BigInt(1e18 * 5000),
    5
  );
};

module.exports.tags = ["AnypadTest"];
