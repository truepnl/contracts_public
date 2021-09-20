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
    "0x55d398326f99059ff775485246999027b3197955",
    "0x55d398326f99059ff775485246999027b3197955",
    "1632156300",
    "1632156400",
    pt30,
    7 * day,
    70 * day,
    7 * day,
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

  await tryVerify(
    vestedPool.address,
    args,
    "contracts/BufferPool.sol:BufferPool"
  );
};

module.exports.tags = ["BufferProd"];
