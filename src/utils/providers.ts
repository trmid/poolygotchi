import { ethers } from "ethers";
import { Config } from "../config";

export const providers = Object.fromEntries(
  Object.keys(Config.networks)
    .map(x => parseInt(x))
    .filter(x => !isNaN(x))
    .map(x => [x, new ethers.providers.JsonRpcProvider(Config.networks[x].rpcUrls[0], x)])
 ) as Record<number, ethers.providers.JsonRpcProvider>
