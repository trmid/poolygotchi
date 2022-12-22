import WeaverFi from "weaverfi";
import hatcheryInfo from "../solidity/artifacts/contracts/PoolygotchiHatchery.sol/PoolygotchiHatchery.json";
import type { ABI, Address, Chain } from "weaverfi/dist/types";
import type { PoolygotchiHatchery } from "../solidity/typechain-types/contracts/PoolygotchiHatchery";

export class Poolygotchi {

  /* Static vars */
  static chain: Chain = "op";
  static address: Address = "0x"; // TODO: set contract address
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
    if(!this.dataCache || !useCache) this.dataCache = await Poolygotchi.function("poolygotchiOf")(this.address);
    return this.dataCache;
  }

  public async healthFactor() {
    return 1;
  }

  /* Static Functions */
  static function<T extends keyof PoolygotchiHatchery["functions"]>(method: T) {
    return <PoolygotchiHatchery[T]>((...args: any) => {
      WeaverFi[this.chain].query(Poolygotchi.address, Poolygotchi.abi as ABI, method, args ?? []);
    });
  }

}