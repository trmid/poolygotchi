import { BigNumber } from "ethers";
import { providers } from "weaverfi/dist/functions";
import mainnet from "./poolTogetherContracts.json";
import { PrizePoolNetwork } from '@pooltogether/v4-client-js';

export default class PoolTogether {

  static providers = {
    1: providers.eth[0],
    10: providers.op[0],
    137: providers.poly[0],
    43114: providers.avax[0]
  };

  static _prizePoolNetwork: PrizePoolNetwork | null = null;
  static prizePoolNetwork () {
    if(!PoolTogether._prizePoolNetwork) PoolTogether._prizePoolNetwork = new PrizePoolNetwork(PoolTogether.providers, mainnet as any);
    return PoolTogether._prizePoolNetwork;
  }

  // static async totalDeposited(address: string) {
  //   const chainIdMap: Record<number, Chain> = {
  //     1: 'eth',
  //     10: 'op',
  //     137: 'poly',
  //     43114: 'avax'
  //   };
  //   let balance = BigNumber.from(0);
  //   for(const deployment of mainnet.contracts) {
  //     if(deployment.type === "Ticket") {
  //       const chain = chainIdMap[deployment.chainId];
  //       const chainBalance: BigNumber = await query(chain, deployment.address as Address, deployment.abi as any, "balanceOf", [address]);
  //       balance = balance.add(chainBalance);
  //     }
  //   }
  //   return balance;
  // }

  static async totalDeposited(address: string) {
    const res = await PoolTogether.prizePoolNetwork().getUsersPrizePoolBalances(address);
    let balance = BigNumber.from(0);
    for(const chain of res) {
      balance = balance.add(chain.balances.token);
    }
    return balance;
  }

}
