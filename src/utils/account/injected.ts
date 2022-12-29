import type { ethers } from "ethers";
import { AccountWithSigner, BaseAccount } from ".";

export default class InjectedAccount extends BaseAccount implements AccountWithSigner {

  constructor(private _signer: ethers.Signer, address: string) {
    _signer.getAddress().then(realAddress => {
      if(realAddress.toLowerCase() !== address.toLowerCase()) {
        console.error("Address does not match! Disconnecting injected wallet...");
        this.disconnect().catch(console.error);
      }
    })
    super(address);
  }

  get signer() {
    return this._signer;
  }

  public async disconnect(): Promise<void> {
    // nothing needed
  }

}