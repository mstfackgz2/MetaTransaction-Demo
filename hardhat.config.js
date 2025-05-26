require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY,
        process.env.WALLET_A_PRIVATE_KEY,
        process.env.WALLET_B_PRIVATE_KEY,
        process.env.WALLET_X_PRIVATE_KEY
      ].filter(Boolean), // undefined olanları filtrele
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
