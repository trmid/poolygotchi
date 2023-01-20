import type { ethers } from "ethers";
import { chains } from "weaverfi/dist/chains";

export namespace Config {

  // Injected build config (from rollup.config.js):
  export const build = JSON.parse(`$BUILD_CONFIG`) as { production: boolean, testnet: boolean, version: string };
  console.log(`Config.build: ${JSON.stringify(build)}`);

  // Injected dev hatchery address:
  const devHatcheryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Live hatchery addresses:
  const opGoerliHatcheryAddress = "0xa316F0Ab085435C0b0bf37DF80874d8028e5DAc9";
  const opHatcheryAddress = "n/a";

  // Determined hatchery address based on build:
  export const hatcheryAddress = build.production ? (build.testnet ? opGoerliHatcheryAddress : opHatcheryAddress) : devHatcheryAddress;

  // Confirmations to wait for:
  export const confirmations = 2;

  // Networks:
  const localNetwork = {
    name: "Local Node",
    chainId: 31337,
    rpcUrls: ['http://127.0.0.1:8545/'],
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://etherscan.io/"]
  };
  const ethNetwork = {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrls: chains.eth.rpcs,
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://etherscan.io/"]
  };
  const opNetwork = {
    name: "Optimism",
    chainId: 10,
    rpcUrls: chains.op.rpcs,
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://optimistic.etherscan.io/"]
  };
  const opGoerliNetwork = {
    name: "Optimism Goerli",
    chainId: 420,
    rpcUrls: ["https://opt-goerli.g.alchemy.com/v2/BKds8JgAEfOpRhWjz8USYxkSPOBG5Am6"],
    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://goerli-optimism.etherscan.io/"]
  };
  const polyNetwork = {
    name: "Polygon",
    chainId: 137,
    rpcUrls: chains.poly.rpcs,
    nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
    blockExplorerUrls: ["https://polygonscan.com/"]
  };
  const avaxNetwork = {
    name: "Avalanche",
    chainId: 43114,
    rpcUrls: chains.avax.rpcs,
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    blockExplorerUrls: ["https://snowtrace.io/"]
  };
  export const networks: Record<number | "eth" | "op" | "poly" | "avax" | "opGoerli" | "local" | "poolygotchi", ethers.providers.Network & { rpcUrls: string[], nativeCurrency: any, blockExplorerUrls: string[] }> = {

    // Current Deployed Chain:
    poolygotchi: build.production ? ( build.testnet ? opGoerliNetwork : opNetwork) : localNetwork,

    // Local:
    31337: localNetwork,
    local: localNetwork,

    // Optimism Goerli:
    420: opGoerliNetwork,
    opGoerli: opGoerliNetwork,

    // Ethereum:
    1: ethNetwork,
    eth: ethNetwork,

    // Optimism:
    10: opNetwork,
    op: opNetwork,

    // Polygon:
    137: polyNetwork,
    poly: polyNetwork,

    // Avalanche:
    43114: avaxNetwork,
    avax: avaxNetwork
  };

}