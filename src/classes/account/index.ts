import { BigNumber, PopulatedTransaction, constants as EtherConst, ContractReceipt } from "ethers";
import type { TransactionReceipt } from '@ethersproject/abstract-provider/src.ts/index';
import WeaverFi from "weaverfi";
import type { ABI, Address, Chain } from "weaverfi/dist/types";
import type { MaybePromise } from "../../utils/maybePromise";
import PoolTogether from "../pooltogether";
import Poolygotchi from "../poolygotchi";
import type SavingsGoal from "../savingsGoal";
import { providers } from "weaverfi/dist/functions";

export interface Account {

  /**
   * Gets the account address
   * @returns Address as string
   */
  get address(): Address

  /**
   * Fetches the savings goal of the account from the Poolygotchi contract
   * @returns SavingsGoal or null
   */
  savingsGoal(): Promise<SavingsGoal | null>
  /**
   * Calculates the health factor of the account's Poolygotchi
   * @returns non-negative number
   */
  healthFactor(): Promise<number>
  /**
   * Fetches the account's current Poolygotchi type
   * @returns BigNumber
   */
  poolygotchiType(): Promise<BigNumber>
  /**
   * Calculates the account's current Poolygotchi growth
   * @returns number between 0 and 1
   */
  poolygotchiGrowth(): Promise<number> // 0-1, zero being baby, 1 being fully grown
  /**
   * Resolves the ENS name of the account, if any exists
   * @returns ENS name or null
   */
  ensName(): Promise<string | null>
  /**
   * Resolves the ENS avatar as a URL of the account, if any exists
   * @returns image URL or null
   */
  ensAvatar(): Promise<string | null>
  /**
   * Resolves a list of URLs for pooly-related avatars that the account owns
   * @returns array of image URLs or null
   */
  poolyAvatars(): Promise<string[] | null>
  /**
   * Gets the account's preferred or default avatar URL
   * @returns image URL
   */
  getAvatar(): Promise<string>
  /**
   * Sets the user's preferred avatar URL and stores it in localStorage
   * @param url avatar image URL
   */
  setAvatar(url: string): void
  /**
   * Fetches info on unclaimed PoolTogether prizes for the account
   * @returns array of TODO
   */
  unclaimedPrizes(): Promise<any[]>
  /**
   * Fetches the total USDC deposit for the account across all PoolTogether deployments
   * @returns USDC deposit balance as a BigNumber
   */
  totalDeposit(): Promise<BigNumber>
  /**
   * Hatches a new poolygotchi for the account
   * @param goal SavingsGoal to post
   * @param type Poolygotchi Type to hatch
   * @returns transaction hash
   */
  hatch(goal: Omit<SavingsGoal, "startDateSeconds">, type: BigNumber): Promise<string>
  /**
   * Sets a new goal for the account
   * @param goal SavingsGoal to set
   * @returns transaction hash
   */
  setGoal(goal: Omit<SavingsGoal, "startDateSeconds">): Promise<string>
  /**
   * Morphs the account's poolygotchi to the new type
   * @param type Poolygotchi type to morph into
   * @returns transaction hash
   */
  morph(type: BigNumber): Promise<string>
  /**
   * Claims a prize from PoolTogether on the given chain
   * @param chain chain to claim from
   * @param prize prize to claim
   * @returns transaction hash
   */
  claim(chain: Chain, prize: any): Promise<string>
  /**
   * Deposits the given amount of USDC to the account's PoolTogether balance on the given chain
   * @param chain chain to deposit to
   * @param amount USDC amount to deposit
   * @returns transaction hash
   */
  deposit(chain: Chain, amount: BigNumber): Promise<string>
  /**
   * Withdraws the given amount of USDC from the account's PoolTogether balance on the given chain
   * @param chain chain to withdraw from
   * @param amount USDC amount to withdraw
   * @returns transaction hash
   */
  withdraw(chain: Chain, amount: BigNumber): Promise<string>
  /**
   * Prompts the user to sign and send the given transaction 
   * @param tx transaction to sign and send
   * @returns transaction hash
   */
  sendTX(tx: PopulatedTransaction): Promise<string>
}

export abstract class BaseAccount implements Account {

  // TODO: create constructor that accepts address and ethers Signer object
  // Any wallet that is not made from ethers needs a custom Signer implementation to work with this

  // Override this getter in extensions:
  get address(): Address {
    return EtherConst.AddressZero;
  }
  async savingsGoal(): Promise<SavingsGoal | null> {
    return Poolygotchi.savingsGoal(this.address);
  }
  async healthFactor(): Promise<number> {
    const goal = await this.savingsGoal();
    if(!goal) return 0;
    const { startBalance, startDateSeconds, timeSpanSeconds, amount } = goal;
    const currentBalance = await PoolTogether.totalDeposited(this.address);
    const balanceDiff = currentBalance.sub(startBalance);
    const currentDateSeconds = Math.floor(Date.now() / 1000);
    const actualRate = balanceDiff.div(BigNumber.from(currentDateSeconds).sub(startDateSeconds));
    const goalRate = amount.div(timeSpanSeconds);

    // TODO: calculate fractional healthFactor from actualRate and goalRate

    return 1;
  }
  async poolygotchiType(): Promise<BigNumber> {
    return await Poolygotchi.type(this.address);
  }
  async poolygotchiGrowth(): Promise<number> {
    return 0; // TODO: calculate growth from current time and goal start time
  }
  async ensName(): Promise<string | null> {
    return await WeaverFi.eth.lookupENS(this.address);
  }
  async ensAvatar(): Promise<string | null> {
    const name = await this.ensName();
    if(name) {
      const provider = providers.eth[0];
      const resolver = await provider.getResolver(name);
      const avatar = await resolver?.getAvatar();
      if(avatar) {
        return avatar.url;
      }
    }
    return null;
  }
  async poolyAvatars(): Promise<string[] | null> {

    // TODO: fetch array of all pooly and FOP related avatars that the account owns and return URLs of each

    return [];
  }
  async getAvatar(): Promise<string> {
    let avatar = localStorage.getItem(`avatar-${this.address}`);
    if(!avatar) {
      avatar = await this.ensAvatar();
    }
    if(!avatar) {
      avatar = (await this.poolyAvatars() ?? [])[0];
    }
    if(!avatar) {
      avatar = "favicon.png";
    }
    this.setAvatar(avatar);
    return avatar;
  }
  setAvatar(url: string) {
    localStorage.setItem(`avatar-${this.address}`, url);
  }
  async unclaimedPrizes(): Promise<any[]> {
    return []; // TODO
  }
  async totalDeposit(): Promise<BigNumber> {
    return PoolTogether.totalDeposited(this.address);
  }
  async hatch(goal: Omit<SavingsGoal, "startDateSeconds">, type: BigNumber): Promise<string> {
    
    return "";
  }

  // Default sendTX with no functionality:
  sendTX(tx: PopulatedTransaction): Promise<string> {
    throw new Error("cannot sendTX from abstract Account function");
  }

}