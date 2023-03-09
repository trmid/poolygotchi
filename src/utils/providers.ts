import { ethers } from "ethers";
import { Config } from "../config";

const providers = Object.fromEntries(
  Object.keys(Config.networks)
    .map(x => parseInt(x))
    .filter(x => !isNaN(x))
    .map(x => [x, new ethers.providers.JsonRpcProvider({ url: Config.networks[x].rpcUrls[0], throttleLimit: 1 }, x)])
 ) as Record<number, ethers.providers.Provider>

export const provider = (chainId: number) => {
  if(chainId in providers) {
    return providers[chainId];
  } else {
    throw new Error(`No provider for chain: ${chainId}`);
  }
}