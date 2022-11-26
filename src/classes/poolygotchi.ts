import WeaverFi from "weaverfi";
import type { BigNumber } from "ethers";
import type { ABI, Address, Chain } from "weaverfi/dist/types";
import type SavingsGoal from "./savingsGoal";

export default class Poolygotchi {

  static chain: Chain = "op";
  static address: Address = "0x"; // TODO: set contract address
  static abi: ABI; // TODO: add ABI

  static async savingsGoal(account: Address): Promise<SavingsGoal> {
    return await WeaverFi.op.query(this.address, this.abi, "savingsGoal", [account]);
  }

  static async type(account: Address): Promise<BigNumber> {
    return await WeaverFi.op.query(this.address, this.abi, "type", [account]);
  }

}