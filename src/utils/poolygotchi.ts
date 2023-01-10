import hatcheryInfo from "../solidity/artifacts/contracts/PoolygotchiHatchery.sol/PoolygotchiHatchery.json";
import { hatcheryAddress, networks } from "../config";
import type { PoolygotchiHatchery } from "../solidity/typechain-types/contracts/PoolygotchiHatchery";
import { BigNumber, ethers } from "ethers";
import PoolTogether from "./poolTogether";

export default class Poolygotchi {

  /* Static vars */
  static address: string = hatcheryAddress;
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

  public possibleStates(healthFactor: number) {
    const states: State[] = [];
    if(healthFactor < -2) {
      states.push('sleeping');
    } else {
      states.push('neutral', 'walking');
      if(healthFactor >= 0) states.push('happy');
      else states.push('sad');
      if(healthFactor < -1) states.push('crying');
    }
    return states;
  }

  /* Static Functions */
  static contract() {
    return new ethers.Contract(Poolygotchi.address, Poolygotchi.abi, new ethers.providers.JsonRpcProvider(networks.poolygotchi.rpcUrls[0], networks.poolygotchi)) as PoolygotchiHatchery;
  }

}

export type State = 'crying' | 'happy' | 'neutral' | 'sad' | 'sleeping' |'walking';