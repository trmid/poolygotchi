import { createIcon } from "@download/blockies";
import type { ethers } from "ethers";
import { network } from "../../config";

export abstract class BaseAccount {
  constructor(private _address: string) { }
  get address() {
    return this._address;
  }
  get avatar() {
    let address = this.address.toLowerCase();
    const storageID = `avatar:${address}`;
    let avatarURI = localStorage.getItem(storageID);
    if(!avatarURI) {
      avatarURI = createIcon({ seed: address }).toDataURL() as string;
      localStorage.setItem(storageID, avatarURI);
    }
    return avatarURI;
  }
}

export default interface Account {
  get address(): string
  get avatar(): string
  getProvider(chainId: number): Promise<ethers.providers.Provider>
  sign(tx: ethers.providers.TransactionRequest): Promise<string>
  disconnect(): Promise<void>
}