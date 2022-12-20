import WeaverFi from "weaverfi";
import hatcheryInfo from "../solidity/artifacts/contracts/PoolygotchiHatchery.sol/PoolygotchiHatchery.json";
import type { BigNumber, ethers } from "ethers";
import type { ABI, Address, Chain } from "weaverfi/dist/types";

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
  public rawData() {
    return Poolygotchi.PoolygotchiOf(this.address);
  }

  /* Static Functions */
  static contract = {
    call: (method: string, args?: any[]) => WeaverFi[this.chain].query(Poolygotchi.address, Poolygotchi.abi as ABI, method, args ?? [])
  }

  static hasPoolygotchi(address: string): Promise<boolean> {
    return this.contract.call("hasPoolygotchi", [address]);
  }

  static numSpecies(): Promise<BigNumber> {
    return this.contract.call("numSpecies");
  }

  static numEnvironments(): Promise<BigNumber> {
    return this.contract.call("numEnvironments");
  }

  static speciesURI(speciesId: BigNumber) {
    return this.contract.call("speciesURI", [speciesId]);
  }

  static environmentURI(environmentId: BigNumber) {
    return this.contract.call("environmentURI", [environmentId]);
  }

  static PoolygotchiOf(address: string): Promise<BigNumber> {
    return this.contract.call("PoolygotchiOf", [address]);
  }

}