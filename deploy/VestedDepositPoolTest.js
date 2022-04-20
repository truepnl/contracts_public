const { hardhatArguments } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const tryVerify = async (contract, args, file) => {
    if (hardhatArguments.network == "ganache") return;
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
  const hour = day / 24;
  const min = hour / 60;
  const goal = BigInt(50000 * 1e18).toString();

  // address _paymentToken,
  // uint256 _startDate,
  // uint256 _closeDate,
  // uint256 _goal

  const args = [
    USDT.address,
    Math.round(Date.now() / 1000),
    Math.round(Date.now() / 1000) + 100 * min,
    goal,
  ];

  const vestedPool = await deploy("VestedDepositPool", {
    from: deployer,
    args: args,
    log: true,
  });

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  await sleep(1000);

  await tryVerify(
    vestedPool.address,
    args,
    "contracts/Pools/VestedDepositPool.sol:VestedDepositPool"
  );

  //dev info
  const usdt = await ethers.getContract("USDT", deployer);
  const pool = await ethers.getContract("VestedDepositPool", deployer);
  await usdt.transfer(deployer, BigInt(1e18 * 1000));
  await usdt.approve(vestedPool.address, BigInt(1e18 * 400000));
  await pool.setAllocation(deployer, BigInt(1e18 * 34090));
  await pool.setAllocation(deployer, BigInt(1e18 * 34090));
  await pool.deposit(BigInt(1e18 * 34090));
};

module.exports.tags = ["testOpenDeploy"];
