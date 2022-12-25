import { BigNumber } from "ethers";
import type { Address, Chain } from "weaverfi";
import { query } from "weaverfi/dist/functions";
import mainnet from "./poolTogetherContracts.json";

export default class PoolTogether {

  static async totalDeposited(address: string) {
    // const prizePoolNetwork = new PrizePoolNetwork(
    //   {
    //     1: providers.eth[0],
    //     10: providers.op[0],
    //     137: providers.poly[0],
    //     43114: providers.avax[0]
    //   },
    //   mainnet as any
    // );
    // let balance = BigNumber.from(0);
    // const usersBalances = await prizePoolNetwork.getUsersPrizePoolBalances(address);
    // for(const userBalance of usersBalances) {
    //   balance.add(userBalance.balances.token);
    // }
    // console.log(`Total balance (${address}): ${balance}`);
    // return balance;
    const chainIdMap: Record<number, Chain> = {
      1: 'eth',
      10: 'op',
      137: 'poly',
      43114: 'avax'
    };
    let balance = BigNumber.from(0);
    for(const deployment of mainnet.contracts) {
      if(deployment.type === "Ticket") {
        const chain = chainIdMap[deployment.chainId];
        console.log(chain);
        const chainBalance: BigNumber = await query(chain, deployment.address as Address, deployment.abi as any, "balanceOf", [address]);
        balance = balance.add(chainBalance);
      }
    }
    console.log(`Total balance (${address}): ${balance}`);
    return balance;
  }

}
