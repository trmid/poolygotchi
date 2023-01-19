import { BigNumber, ethers } from "ethers";
import { providers } from "weaverfi/dist/functions";
import mainnet from "./poolTogetherContracts.json";
import { DrawResults, PrizePoolNetwork, User } from '@pooltogether/v4-client-js';
import type { AccountWithSigner } from "./account";
import { PrizeInfo } from "./storage";

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

  static prizeDistributor(chain: number) {
    const address = mainnet.contracts.filter(x => x.chainId == chain && x.type === "PrizeDistributor")[0]?.address;
    if(!address) throw new Error(`Could not PrizeDistributor for chain: ${chain}`);
    const prizeDistributor = PoolTogether.prizePoolNetwork().getPrizeDistributor(chain, address);
    if(!prizeDistributor) throw new Error(`Could not find prize distributor for chain: ${chain} and address: ${address}`);
    return prizeDistributor;
  }

  static getUnclaimedDraws(address: string) {

    // Fetch the draw results for each chain:
    return Promise.all([1, 10, 137, 43114].map(chainId => new Promise<{ chainId: number, unclaimedDraws: DrawResults[] }>(async (resolve, reject) => {
      try {
        const distributor = PoolTogether.prizeDistributor(chainId);

        // Get last two weeks drawIds:
        let drawIds = (await distributor.getValidDrawIds()).slice(-14, -1);

        // Get stored prize check info:
        let storedPrizeInfo = PrizeInfo.get(address, chainId);
        if(storedPrizeInfo) {

          // Prevent double-checking of drawIds:
          const lastIndexChecked = drawIds.indexOf(storedPrizeInfo.lastDrawChecked);
          if(lastIndexChecked > -1) drawIds = drawIds.slice(lastIndexChecked + 1);

          // Combine unclaimed drawIds with new drawIds:
          drawIds = storedPrizeInfo.unclaimed.concat(drawIds);
        }
        console.log(drawIds);
        if(drawIds.length > 0) {
          const latestDrawChecked = drawIds[drawIds.length - 1];

          // Check results:
          const prizeDistributions = await distributor.getPrizeDistributions(drawIds);
          const resultsMap = await distributor.getUsersDrawResultsForDrawIds(address, drawIds, drawIds.map(id => prizeDistributions[id].maxPicksPerUser));
          const results = drawIds.map(id => resultsMap[id]);
          const winningDraws = results.filter(x => x.totalValue.gt(0));
          const claimedAmountMap = await distributor.getUsersClaimedAmounts(address, winningDraws.map(x => x.drawId));
          const unclaimedDraws = winningDraws.filter(x => claimedAmountMap[x.drawId].eq(0));

          // Save info:
          PrizeInfo.set(address, {
            chainId,
            lastDrawChecked: latestDrawChecked,
            unclaimed: unclaimedDraws.map(x => x.drawId)
          });

          resolve({ chainId, unclaimedDraws });
        } else {
          resolve({ chainId, unclaimedDraws: [] });
        }
      } catch(err) {
        reject(err);
      }
    })));
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

  static async withdraw(chain: number, amount: BigNumber, account: AccountWithSigner) {
    await account.switchChain(chain);
    const prizePool = PoolTogether.prizePool(chain);
    const user = new User(prizePool.prizePoolMetadata, account.signer, prizePool);
    const { ticket } = await prizePool.getUsersPrizePoolBalances(account.address);
    if(ticket.lt(amount)) {
      throw new NotEnoughAllowanceError(ticket, amount);
    }
    return await user.withdraw(amount);
  }

}

export class NotEnoughAllowanceError extends Error {
  readonly isNotEnoughAllowanceError = true;
  constructor (readonly available: BigNumber, readonly needed: BigNumber) {
    super(`Expected: ${needed}, Available: ${available}`);
  }
}

export class NotEnoughDepositedError extends Error {
  readonly isNotEnoughDepositedError = true;
  constructor (readonly available: BigNumber, readonly needed: BigNumber) {
    super(`Expected: ${needed}, Deposited: ${available}`);
  }
}