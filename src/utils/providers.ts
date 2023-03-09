import { ethers } from "ethers";
import { Config } from "../config";
import { RpcUrl } from "./storage";

const defaultProviders = Object.fromEntries(
  Object.keys(Config.networks)
    .map(x => parseInt(x))
    .filter(x => !isNaN(x))
    .map(x => [x, new ethers.providers.JsonRpcProvider({ url: Config.networks[x].rpcUrls[0], throttleLimit: 1 }, x)])
 ) as Record<number, ethers.providers.Provider>

export const provider = (chainId: number) => {
  const customRpc = RpcUrl.get(chainId);
  if(customRpc) {
    return new ethers.providers.JsonRpcProvider({ url: customRpc, throttleLimit: 1 }, chainId);
  } else if(chainId in defaultProviders) {
    return defaultProviders[chainId];
  } else {
    throw new Error(`No provider for chain: ${chainId}`);
  }
}