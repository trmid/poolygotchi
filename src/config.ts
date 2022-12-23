import type { ethers } from "ethers";

export const hatcheryAddress = "0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690";
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