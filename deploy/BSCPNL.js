const tryVerify = require("./utils/tryVerify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const token = await deploy("PNL", {
    from: deployer,
    args: ["10000000000000000000000000"],
    log: true,
  });

  await tryVerify(
    token.address,
    ["10000000000000000000000000"],
    "contracts/BEP20PNL/bscPNL.sol:PNL"
  );
};

module.exports.tags = ["BSCPNL"];
