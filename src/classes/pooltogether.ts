import { BigNumber } from "ethers";
import WeaverFi from "weaverfi";
import type { Address } from "weaverfi/dist/types";

export default class PoolTogether {

  static async totalDeposited(account: Address) {
    const opBalances = await WeaverFi.op.getProjectBalance(account, 'pooltogether');
    console.log(`OP PT Balance: `, opBalances);

    // TODO: get rest of balances and add them together

    return BigNumber.from(0);
  }

}