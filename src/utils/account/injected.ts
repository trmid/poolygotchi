import type { ethers } from "ethers";
import Account, { BaseAccount } from ".";

export default class InjectedAccount extends BaseAccount implements Account {

  constructor(private signer: ethers.Signer, address: string) {
    console.log("Connected Signer:", signer);
    signer.getAddress().then(realAddress => {
      if(realAddress.toLowerCase() !== address.toLowerCase()) {
        console.error("Address does not match! Disconnecting injected wallet...");
        this.disconnect().catch(console.error);
      }
    })
    super(address);
  }

  public async getProvider(chainId: number) {
    const provider = this.signer.provider;
    if(provider && (await provider.getNetwork()).chainId == chainId) return provider;
    throw new Error("Signer connected to wrong network...");
  }

  public async sign(tx: ethers.providers.TransactionRequest) {
    return (await this.signer.sendTransaction(tx)).hash;
  }

  public async disconnect(): Promise<void> {
    // nothing needed
  }

}