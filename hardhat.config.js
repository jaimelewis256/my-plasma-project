require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    plasmaTestnet: {
      url: process.env.RPC_ENDPOINT || "https://testnet-rpc.plasma.to",
      chainId: 9746,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};
