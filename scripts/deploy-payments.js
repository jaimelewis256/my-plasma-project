const hre = require("hardhat");

async function main() {
  const [deployer, alice, bob, charlie] = await hre.ethers.getSigners();

  const PlasmaPayments = await hre.ethers.getContractFactory("PlasmaPayments");
  const payments = await PlasmaPayments.deploy();
  await payments.waitForDeployment();

  const address = await payments.getAddress();
  console.log("PlasmaPayments deployed to:", address);

  // Register demo contacts
  await payments.connect(deployer).register("Jaime");
  await payments.connect(alice).register("Nele");
  await payments.connect(bob).register("Dimming");
  await payments.connect(charlie).register("Charlie");

  console.log("Registered contacts: Jaime, Nele, Dimming, Charlie");
  console.log("\nTest accounts:");
  console.log("  Jaime   (Account #0):", deployer.address);
  console.log("  Nele    (Account #1):", alice.address);
  console.log("  Dimming (Account #2):", bob.address);
  console.log("  Charlie (Account #3):", charlie.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
