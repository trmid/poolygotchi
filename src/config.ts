import type { ethers } from "ethers";

export const hatcheryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// export const network: ethers.providers.Network & { rpcUrls: string[], nativeCurrency: any, blockExplorerUrls: string[] } = {
//   name: "Ethereum",
//   chainId: 1,
//   rpcUrls: ['https://cloudflare-eth.com'],
//   nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
//   blockExplorerUrls: ["https://etherscan.io/"]
// }
export const network: ethers.providers.Network & { rpcUrls: string[], nativeCurrency: any, blockExplorerUrls: string[] } = {
  name: "Local Node",
  chainId: 31337,
  rpcUrls: ['http://127.0.0.1:8545/'],
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  blockExplorerUrls: ["https://etherscan.io/"]
}