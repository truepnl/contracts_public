const { Wallet } = require("@ethersproject/wallet");
const { utils } = require("ethers");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const { SIGNERPK, TESTER } = process.env;

  const testerAcc = TESTER;
  const signerAcc = new Wallet(SIGNERPK);

  const tokenArgs = [BigInt(10000000000000000000000 * 10 ** 18).toString()];
  const USDT = await deploy("USDT", {
    from: deployer,
    args: tokenArgs,
    log: true,
  });

  const day = 86400;
  const args = [
    USDT.address,
    Math.floor(Date.now() / 1000) - 1 * day,
    Math.floor(Date.now() / 1000) + 1 * day,
    BigInt(50000 * 10 ** 18).toString(),
  ];

  const depositPool = await deploy("DepositPoolV3", {
    from: deployer,
    args: args,
    log: true,
  });

  //dev info
  const usdt = await ethers.getContract("USDT", deployer);
  const pool = await ethers.getContract("DepositPoolV3", deployer);
  await usdt.transfer(testerAcc, BigInt(1e18 * 10000));
  await usdt.approve(depositPool.address, BigInt(1e18 * 400000));

  //signature info
  // https://docs.ethers.io/v5/api/signer/#Signer-signMessage - docs
  const data = [BigInt(1e18 * 200), 0, testerAcc, pool.address];

  let mesGenerated = ethers.utils.solidityKeccak256(
    ["uint256", "uint256", "address", "address"],
    data
  );

  const signature = await signerAcc.signMessage(
    ethers.utils.arrayify(mesGenerated)
  );

  console.log(`This is your signature ${signature}`);
};

module.exports.tags = ["DepositPoolV3Test"];
