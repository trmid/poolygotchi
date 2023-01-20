import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.16",
  networks: {
    optimism: {
      url: "https://mainnet.optimism.io",
      accounts: process.env["DEPLOY_KEY"] ? [process.env["DEPLOY_KEY"].trim()] : []
    },
    optimismGoerli: {
      url: "https://opt-goerli.g.alchemy.com/v2/BKds8JgAEfOpRhWjz8USYxkSPOBG5Am6",
      accounts: process.env["DEPLOY_KEY"] ? [process.env["DEPLOY_KEY"].trim()] : []
    }
  }
};

export default config;
