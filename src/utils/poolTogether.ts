import { BigNumber, ethers } from "ethers";
import { providers } from "weaverfi/dist/functions";
import mainnet from "./poolTogetherContracts.json";
import { PrizePoolNetwork, User } from '@pooltogether/v4-client-js';
import type { AccountWithSigner } from "./account";

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

  static async totalDeposited(address: string) {
    const res = await PoolTogether.prizePoolNetwork().getUsersPrizePoolBalances(address);
    let balance = BigNumber.from(0);
    for(const chain of res) {
      balance = balance.add(chain.balances.ticket);
    }
    return balance;
  }

  static prizePool(chain: number) {
    const address = mainnet.contracts.filter(x => x.chainId == chain && x.type === "YieldSourcePrizePool")[0]?.address;
    if(!address) throw new Error(`Could not find YieldSourcePrizePool for chain: ${chain}`);
    const prizePool = PoolTogether.prizePoolNetwork().getPrizePool(chain, address);
    if(!prizePool) throw new Error(`Could not find prize pool for chain: ${chain} and address: ${address}`);
    return prizePool;
  }

  static async approve(chain: number, amount: BigNumber, account: AccountWithSigner) {
    await account.switchChain(chain);
    const prizePool = PoolTogether.prizePool(chain);
    const user = new User(prizePool.prizePoolMetadata, account.signer, prizePool);
    const { isApproved, allowanceUnformatted } = await prizePool.getUsersDepositAllowance(account.address);
    if(!isApproved || allowanceUnformatted.lt(amount)) {
      return await user.approveDeposits(amount);
    }
  }

  static async deposit(chain: number, amount: BigNumber, account: AccountWithSigner) {
    await account.switchChain(chain);
    const prizePool = PoolTogether.prizePool(chain);
    const user = new User(prizePool.prizePoolMetadata, account.signer, prizePool);
    const { isApproved, allowanceUnformatted } = await prizePool.getUsersDepositAllowance(account.address);
    if(!isApproved || allowanceUnformatted.lt(amount)) {
      throw new NotEnoughAllowanceError(allowanceUnformatted, amount);
    }
    const delegateAddress = await user.getTicketDelegate();
    if(delegateAddress === ethers.constants.AddressZero) {
      return await user.depositAndDelegate(amount, account.address);
    } else {
      return await user.deposit(amount);
    }
  }

}

export class NotEnoughAllowanceError extends Error {
  readonly isNotEnoughAllowanceError = true;
  constructor (readonly available: BigNumber, readonly needed: BigNumber) {
    super(`Expected: ${needed}, Available: ${available}`);
  }
}