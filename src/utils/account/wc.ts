import type { SignClient } from "@walletconnect/sign-client/dist/types/client";
import type { SessionTypes } from "@walletconnect/types";
import { ethers } from "ethers";
import Account, { BaseAccount } from ".";
import { network } from "../../config";

export default class WCAccount extends BaseAccount implements Account {

  constructor(private signClient: SignClient, private session: SessionTypes.Struct) {
    const address = ((session.namespaces["eip155"].accounts[0] ?? "").match(/eip155:1:(.+)/) ?? [])[1] ?? null;
    console.log(address);
    super(address);
  }

  public async getProvider(chainId: number): Promise<ethers.providers.Provider> {
    if(network.chainId != chainId) throw new Error("Cannot get provider for unsupported chainId");
    return new ethers.providers.JsonRpcProvider(network.rpcUrls[0], chainId);
  }

  public async sign(tx: ethers.providers.TransactionRequest): Promise<string> {
    const res = await this.signClient.request<any>({
      topic: this.session.topic,
      chainId: 'eip155:1',
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sendTransaction",
        params:[{
          from: this.address,
          to: tx.to,
          data: tx.data,
          gasPrice: tx.gasPrice ? ethers.BigNumber.from(tx.gasPrice).toHexString() : undefined,
          gasLimit: tx.gasLimit ? ethers.BigNumber.from(tx.gasLimit).toHexString() : undefined,
          value: tx.value ? ethers.BigNumber.from(tx.value).toHexString() : undefined
        }]
      } as any
    });
    return res.result;
  }

  public async disconnect(): Promise<void> {
    console.warn("Not implemented!");
  }

}