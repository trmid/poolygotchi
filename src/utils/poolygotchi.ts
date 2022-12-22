import WeaverFi from "weaverfi";
import hatcheryInfo from "../solidity/artifacts/contracts/PoolygotchiHatchery.sol/PoolygotchiHatchery.json";
import { ethers } from "ethers";
import type { ABI, Address, Chain } from "weaverfi/dist/types";
import type { PoolygotchiHatchery } from "../solidity/typechain-types/contracts/PoolygotchiHatchery";

export class Poolygotchi {

  /* Static vars */
  static chain: Chain = "op";
  static address: Address = "0x"; // TODO: set contract address
  static abi = hatcheryInfo.abi;

  /* Private vars */
  private address: string;

  /* Constructor */
  constructor(address: string) {
    this.address = address;
  }

  /* Functions */
  public rawData(): Promise<PoolygotchiHatchery.PoolygotchiStructOutput> {
    return Poolygotchi.function("poolygotchiOf")(this.address);
  }

  /* Static Functions */
  static function<T extends keyof PoolygotchiHatchery["functions"]>(method: T) {
    return <PoolygotchiHatchery[T]>((...args: any) => {
      WeaverFi[this.chain].query(Poolygotchi.address, Poolygotchi.abi as ABI, method, args ?? []);
    });
  }

}