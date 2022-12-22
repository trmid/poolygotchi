import type { ethers } from "ethers";

export const hatcheryAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";
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