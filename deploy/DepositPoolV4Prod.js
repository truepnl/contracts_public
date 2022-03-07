const { Wallet } = require("@ethersproject/wallet");
const { utils } = require("ethers");
const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const args = [
    "0x55d398326f99059ff775485246999027b3197955",
    1645091462,
    1650534588,
    BigInt(60000 * 10 ** 18).toString(),
  ];

  const depositPool = await deploy("DepositPoolV4", {
    from: deployer,
    args: args,
    log: true,
  });

  await tryVerify(
    depositPool.address,
    args,
    "contracts/Pools/DepositPoolV4.sol:DepositPoolV4"
  );
};

module.exports.tags = ["DepositPoolV4"];
