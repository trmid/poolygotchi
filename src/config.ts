import type { ethers } from "ethers";
import { chains } from "weaverfi/dist/chains";
export const hatcheryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
export const networks: Record<number | "eth" | "op" | "poly" | "avax" | "local" | "poolygotchi", ethers.providers.Network & { rpcUrls: string[], nativeCurrency: any, blockExplorerUrls: string[] }> = {

  // Current Deployed Chain:
  poolygotchi: localNetwork, // TODO: automate changing this on build local vs. build production

  // Local:
  31337: localNetwork,
  local: localNetwork,

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