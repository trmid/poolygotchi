import type { ethers } from "ethers";

export const ginftAddress = "";
export const network: ethers.providers.Network & { rpcUrls: string[], nativeCurrency: any, blockExplorerUrls: string[] } = {
  name: "Ethereum",
  chainId: 1,
  rpcUrls: ['https://cloudflare-eth.com'],
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  blockExplorerUrls: ["https://etherscan.io/"]
}