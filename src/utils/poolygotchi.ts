import hatcheryInfo from "../solidity/artifacts/contracts/PoolygotchiHatchery.sol/PoolygotchiHatchery.json";
import { hatcheryAddress, networks } from "../config";
import type { Address } from "weaverfi/dist/types";
import type { PoolygotchiHatchery } from "../solidity/typechain-types/contracts/PoolygotchiHatchery";
import { BigNumber, ethers } from "ethers";
import PoolTogether from "./poolTogether";

export default class Poolygotchi {

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
    const secondsInWeek = 60 * 60 * 24 * 7;
    const { goalAmountWeekly, startBalance } = await this.data();
    const totalDeposited = await PoolTogether.totalDeposited(this.address);
    const balanceChange = totalDeposited.sub(startBalance);
    const secondsOff = balanceChange.mul(secondsInWeek).div(BigNumber.from(goalAmountWeekly));
    return secondsOff.toNumber() / secondsInWeek;
  }

  /* Static Functions */
  static contract() {
    return new ethers.Contract(Poolygotchi.address, Poolygotchi.abi, new ethers.providers.JsonRpcProvider(networks.poolygotchi.rpcUrls[0], networks.poolygotchi)) as PoolygotchiHatchery;
  }

}