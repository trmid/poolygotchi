import WeaverFi from "weaverfi";
import hatcheryInfo from "../solidity/artifacts/contracts/PoolygotchiHatchery.sol/PoolygotchiHatchery.json";
import { hatcheryAddress, network } from "../config";
import type { ABI, Address, Chain } from "weaverfi/dist/types";
import type { PoolygotchiHatchery } from "../solidity/typechain-types/contracts/PoolygotchiHatchery";
import { ethers } from "ethers";

export class Poolygotchi {

  /* Static vars */
  static address: Address = hatcheryAddress;
  static abi = hatcheryInfo.abi;

  /* Private vars */
  public readonly address: string;
  private dataCache: PoolygotchiHatchery.PoolygotchiStructOutput | null = null;

  /* Constructor */
  constructor(address: string) {
    this.address = address;
  }

  /* Functions */
  public async data({ useCache = true } = {}): Promise<PoolygotchiHatchery.PoolygotchiStructOutput> {
    if(!this.dataCache || !useCache) this.dataCache = await Poolygotchi.contract().poolygotchiOf(this.address);
    return this.dataCache;
  }

  public async healthFactor() {
    return 1;
  }

  /* Static Functions */
  static contract() {
    return new ethers.Contract(Poolygotchi.address, Poolygotchi.abi, new ethers.providers.JsonRpcProvider(network.rpcUrls[0], network)) as PoolygotchiHatchery;
  }

}