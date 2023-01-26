import { BigNumber, ethers, Signer } from "ethers";
import { providers } from "weaverfi/dist/functions";
import mainnet from "./poolTogetherContracts.json";
import { DrawResults, PrizePoolNetwork, User } from '@pooltogether/v4-client-js';
import type { AccountWithSigner } from "./account";
import { PrizeInfo } from "./storage";

export default class PoolTogether {

  static gasLimit = {
    deposit: 750_001,
    withdraw: 750_001,
    claim: (numDraws: number) => 200_001 + numDraws * 300_000
  };

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

  static prizeDistributor(chain: number, network?: PrizePoolNetwork) {
    const address = mainnet.contracts.filter(x => x.chainId == chain && x.type === "PrizeDistributor")[0]?.address;
    if(!address) throw new Error(`Could not PrizeDistributor for chain: ${chain}`);
    const prizeDistributor = (network ?? PoolTogether.prizePoolNetwork()).getPrizeDistributor(chain, address);
    if(!prizeDistributor) throw new Error(`Could not find prize distributor for chain: ${chain} and address: ${address}`);
    return prizeDistributor;
  }

  static getNewestDraw(chainId: number) {
    return PoolTogether.prizeDistributor(chainId).getNewestDraw();
  }

  /**
   * Checks the most recent unclaimed draws for an address. Good for weekly use cases, but does not exhaust the entire draw history.
   * 
   * @param address user's address
   * @param depth how many draws to check
   * @returns an array of chains checked with the prizes found for each
   */
  static getUnclaimedDraws(address: string, depth = 7) {

    // Fetch the draw results for each chain:
    return Promise.all([1, 10, 137, 43114].map(chainId => new Promise<{ chainId: number, unclaimedDraws: DrawResults[] }>(async (resolve, reject) => {
      try {
        const twab = await PoolTogether.prizePool(chainId).getUsersTicketTwabAt(address, Math.floor(Date.now() / 1000));
        if(twab.gt(0)) {
          const distributor = PoolTogether.prizeDistributor(chainId);

          // Slice to specified depth:
          const validDrawIds = await distributor.getValidDrawIds();
          const validDrawIdSet = new Set(validDrawIds);
          depth = Math.min(depth, validDrawIds.length);
          let drawIds = validDrawIds.slice(-depth, -1);

          // Get stored prize check info:
          let storedPrizeInfo = PrizeInfo.get(address, chainId);
          const validCheckedIdSet = new Set([...(storedPrizeInfo?.checkedIds ?? [])].filter(id => validDrawIdSet.has(id)));
          if(storedPrizeInfo) {

            // Prevent double-checking of drawIds:
            drawIds = drawIds.filter(id => !validCheckedIdSet.has(id));

            // Combine unexpired unclaimed drawIds with new drawIds:
            drawIds = storedPrizeInfo.unclaimed.filter(id => validDrawIdSet.has(id)).concat(drawIds);
          }
          if(drawIds.length > 0) {

            // Check results:
            const prizeDistributions = await distributor.getPrizeDistributions(drawIds);
            const resultsMap = await distributor.getUsersDrawResultsForDrawIds(address, drawIds, drawIds.map(id => prizeDistributions[id].maxPicksPerUser));
            const results = drawIds.map(id => resultsMap[id]);
            const winningDraws = results.filter(x => x.totalValue.gt(0));
            const claimedAmountMap = await distributor.getUsersClaimedAmounts(address, winningDraws.map(x => x.drawId));
            const unclaimedDraws = winningDraws.filter(x => claimedAmountMap[x.drawId].eq(0));

            // Add all checked Ids to the set:
            for(const id of drawIds) {
              validCheckedIdSet.add(id);
            }

            // Save info:
            PrizeInfo.set(address, {
              chainId,
              checkedIds: [...validCheckedIdSet],
              unclaimed: unclaimedDraws.map(x => x.drawId)
            });

            resolve({ chainId, unclaimedDraws });
          } else {
            resolve({ chainId, unclaimedDraws: [] });
          }
        } else {
          resolve({ chainId, unclaimedDraws: [] });
        }
      } catch(err) {
        reject(err);
      }
    })));
  }

  private static _ongoingSearches = new Map<string, ((draw: DrawResults | null, done: boolean) => void)[]>();
  static async searchForUnclaimedDraws(chain: number, address: string, onDiscovery: (draw: DrawResults | null, done: boolean) => void) {
    const key = `${address}:${chain}`;
    const removeListener = () => {
      const searches = this._ongoingSearches.get(key);
      if(searches) {
        this._ongoingSearches.set(key, searches.filter(x => x != onDiscovery));
      }
    };
    let searches = this._ongoingSearches.get(key) ?? [];
    searches.push(onDiscovery);
    this._ongoingSearches.set(key, searches);
    if(searches.length == 1) {
      const distributor = PoolTogether.prizeDistributor(chain);
      const validDrawIds = (await distributor.getValidDrawIds()).slice(0, -1);
      const validDrawIdSet = new Set(validDrawIds);
      const prizeDistributions = await distributor.getPrizeDistributions(validDrawIds);
      const idsToCheck = [...validDrawIds];
      let querying = false;
      const timer = setInterval(async () => {

        // Check if there are any listeners left:
        if((this._ongoingSearches.get(key) ?? []).length == 0) {
          clearInterval(timer);

        // Ensure we are not still waiting for queries:
        } else if(!querying) {
          try {
            querying = true;
            const storedPrizeInfo = PrizeInfo.get(address, chain);
            const checkedIdSet = new Set((storedPrizeInfo?.checkedIds ?? []).filter(x => validDrawIdSet.has(x)));

            // Find next ID to check:
            let drawId = -1;
            do {
              if(idsToCheck.length == 0) {
                clearInterval(timer);
                for(const cb of (this._ongoingSearches.get(key) ?? [])) {
                  cb(null, true);
                }
                return;
              }
              drawId = idsToCheck.pop() as number;
            } while(checkedIdSet.has(drawId));

            // Append to checkedIds:
            checkedIdSet.add(drawId);
            PrizeInfo.set(address, {
              chainId: chain,
              unclaimed: storedPrizeInfo?.unclaimed ?? [],
              checkedIds: [...checkedIdSet]
            });

            // Check draw:
            const draw = await distributor.getUsersDrawResultsForDrawId(address, drawId, prizeDistributions[drawId].maxPicksPerUser);

            // Check if winner:
            if(draw.totalValue.gt(0)) {

              // Check if not claimed:
              if((await distributor.getUsersClaimedAmount(address, drawId)).eq(0)) {
                const storedPrizeInfo = PrizeInfo.get(address, chain);
                const unclaimed = new Set(storedPrizeInfo?.unclaimed ?? []);
                unclaimed.add(drawId);
                PrizeInfo.set(address, {
                  chainId: chain,
                  unclaimed: [...unclaimed],
                  checkedIds: storedPrizeInfo?.checkedIds ?? [],
                });
                const done = idsToCheck.length == 0;
                for(const cb of (this._ongoingSearches.get(key) ?? [])) {
                  cb(draw, done);
                }
                if(done) clearInterval(timer);
              }
            }
          } catch(err) {
            console.error(err);
          } finally {
            querying = false;
          }
        }
      }, 500);
    }
    return removeListener;
  }

  static claim(chain: number, draws: Record<number, DrawResults>, signer: Signer) {
    if(!signer.provider) signer = signer.connect(PoolTogether.providers[chain as 1]);
    const network = new PrizePoolNetwork({ ...PoolTogether.providers, [chain]: signer }, mainnet as any);
    return PoolTogether.prizeDistributor(chain, network).claimPrizesAcrossMultipleDrawsByDrawResults(draws, { gasLimit: PoolTogether.gasLimit.claim(Object.keys(draws).length) });
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
      return await user.depositAndDelegate(amount, account.address, { gasLimit: PoolTogether.gasLimit.deposit });
    } else {
      return await user.deposit(amount, { gasLimit: PoolTogether.gasLimit.deposit });
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
    return await user.withdraw(amount, { gasLimit: PoolTogether.gasLimit.withdraw });
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