const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const CONTRACT = "0xd9DEBe4f00fe7AbD7921CA0Dec92433495b8F0AF";

  // Create a new wallet for PracticeBot
  const botKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
  const botWallet = new hre.ethers.Wallet(botKey, hre.ethers.provider);
  console.log("PracticeBot address:", botWallet.address);

  // Fund bot with XPL for gas
  console.log("Sending 0.05 XPL to PracticeBot for gas...");
  const fundTx = await deployer.sendTransaction({
    to: botWallet.address,
    value: hre.ethers.parseEther("0.05"),
  });
  await fundTx.wait();
  console.log("Funded.");

  // Register PracticeBot on the contract
  const contract = await hre.ethers.getContractAt("PlasmaPayments", CONTRACT, botWallet);
  console.log("Registering as PracticeBot...");
  const regTx = await contract.register("PracticeBot");
  await regTx.wait();
  console.log("PracticeBot registered!");

  // Send some USDT to PracticeBot so it has a balance
  const USDT = "0x502012b361AebCE43b26Ec812B74D9a51dB4D412";
  const usdtAbi = ["function transfer(address to, uint256 amount) returns (bool)", "function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
  const usdt = new hre.ethers.Contract(USDT, usdtAbi, deployer);
  const decimals = await usdt.decimals();
  const amount = hre.ethers.parseUnits("2", decimals);
  const deployerBal = await usdt.balanceOf(deployer.address);
  console.log("Deployer USDT balance:", hre.ethers.formatUnits(deployerBal, decimals));

  if (deployerBal >= amount) {
    console.log("Sending 2 USDT to PracticeBot...");
    const usdtTx = await usdt.transfer(botWallet.address, amount);
    await usdtTx.wait();
    console.log("PracticeBot funded with 2 USDT!");
  } else {
    console.log("Not enough USDT to fund PracticeBot, skipping.");
  }

  console.log("\nDone! PracticeBot is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
