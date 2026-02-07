const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "XPL");

  const PlasmaPayments = await hre.ethers.getContractFactory("PlasmaPayments");
  const payments = await PlasmaPayments.deploy();
  await payments.waitForDeployment();

  const address = await payments.getAddress();
  console.log("PlasmaPayments deployed to:", address);

  // Register the deployer
  const tx = await payments.register("Jaime");
  await tx.wait();
  console.log("Registered deployer as 'Jaime'");

  console.log("\nDone! Share this contract address with your team:");
  console.log(address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
