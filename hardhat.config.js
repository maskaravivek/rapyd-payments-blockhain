require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    holesky: {
      url: process.env.HOLESKY_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 17000,
    },
  },
};
