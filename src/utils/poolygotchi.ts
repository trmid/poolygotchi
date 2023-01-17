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
    const { goalAmountWeekly, startBalance, goalStartDate } = await this.data();
    const totalDeposited = await PoolTogether.totalDeposited(this.address);
    const balanceChange = totalDeposited.sub(startBalance);
    const secondsSaved = balanceChange.mul(secondsInWeek).div(BigNumber.from(goalAmountWeekly));
    const secondsOff = goalStartDate.add(secondsSaved).sub(Math.floor(Date.now() / 1000)).toNumber();
    console.log(`Seconds off saving goal: ${secondsOff}`);
    return secondsOff / secondsInWeek;
  }

  public possibleStates(healthFactor: number): { state: State, chance: number }[] {
    if(healthFactor < -3) {
      return [{ state: 'hibernating', chance: 1 }];
    } else if(healthFactor < -2) {
      return [
        { state: 'crying', chance: 2 },
        { state: 'sad', chance: 3 },
        { state: 'neutral', chance: 1 },
        { state: 'walking', chance: 1 }
      ];
    } else if(healthFactor < -1) {
      return [
        { state: 'sad', chance: 6 },
        { state: 'neutral', chance: 4 },
        { state: 'walking', chance: 2 },
        { state: 'sleeping', chance: 1 }
      ];
    } else if(healthFactor < 0) {
      return [
        { state: 'neutral', chance: 6 },
        { state: 'walking', chance: 6 },
        { state: 'sleeping', chance: 1 }
      ];
    } else {
      return [
        { state: 'happy', chance: 6 },
        { state: 'neutral', chance: 6 },
        { state: 'walking', chance: 6 },
        { state: 'sleeping', chance: 1 }
      ];
    }
  }

  /* Static Functions */
  static contract() {
    return new ethers.Contract(Poolygotchi.address, Poolygotchi.abi, new ethers.providers.JsonRpcProvider(networks.poolygotchi.rpcUrls[0], networks.poolygotchi)) as PoolygotchiHatchery;
  }

  static expression(state: State, name: string) {
    const expressionDuration = 20; // 20 seconds
    const possibleExpressions = Poolygotchi.expressions[state];
    const timedIndex = Math.floor((Date.now() / 1000) / expressionDuration) % possibleExpressions.length;
    const expression = possibleExpressions[timedIndex];
    return expression.replace(/\$name/g, name || "Anon");
  }

  /**
   * Key Expressions
   * 
   * Maps each State to an expressive statement that a poolygotchi would say.
   */
  static expressions: Record<State, string[]> = {
    neutral: [
      "$name reassures you with a confident smile.",
      "$name is confident.",
      "$name is looking optimistic today.",
      "$name is looking for something to do.",
      "$name wants to play a game.",
      "$name is wandering around.",
      "$name is hoping for a win today!",
      "$name could go for a swim.",
      "$name is feeling lucky!"
    ],
    happy: [
      "$name looks very happy!",
      "$name is happy to see you!",
      "$name is proud of you.",
      "$name is having fun!",
      "$name feels like winning today!",
      "$name could go for a swim!",
      "$name is feeling lucky!"
    ],
    sad: [
      "$name looks upset about something...",
      "$name could use some cheering up...",
      "$name is sad today. Maybe we should play a game!",
      "$name is pouting.",
      "$name is hoping for a win."
    ],
    crying: [
      "$name looks very upset...",
      "$name could use some cheering up...",
      "$name is feeling distant and ignored.",
      "$name won't stop crying!",
      "$name could really use a win."
    ],
    sleeping: [
      "$name is taking a nap.",
      "$name looks cozy."
    ],
    hibernating: ["$name is hibernating. Things have been a little quiet around here lately..."],
    walking: ["$name is wandering around."]
  }

}

export type Animation = 'crying' | 'happy' | 'neutral' | 'sad' | 'sleeping' | 'walking';
export type State = Animation | 'hibernating';