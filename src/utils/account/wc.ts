import type { SignClient } from "@walletconnect/sign-client/dist/types/client";
import type { SessionTypes } from "@walletconnect/types";
import type { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import type { TransactionResponse } from "@ethersproject/abstract-provider/src.ts/index"
import type { Deferrable } from "@ethersproject/properties";
import { Bytes, hexlify } from "@ethersproject/bytes";
import { ethers } from "ethers";
import { AccountWithSigner, BaseAccount } from ".";
import { Signer } from "@ethersproject/abstract-signer";
import { Config } from "../../config";
import { poll } from "ethers/lib/utils";

export default class WCAccount extends BaseAccount implements AccountWithSigner {

  private _signer: WCSigner;

  constructor(private signClient: SignClient, private session: SessionTypes.Struct) {
    const address = ((session.namespaces["eip155"].accounts[0] ?? "").match(/eip155:1:(.+)/) ?? [])[1] ?? null;
    super(address);
    this._signer = new WCSigner(this.signClient, this.session, new ethers.providers.JsonRpcProvider(Config.networks.op.rpcUrls[0], Config.networks.op));
  }

  get signer() {
    return this._signer;
  }

  public async switchChain(chain: number) {
    const provider = new ethers.providers.JsonRpcProvider(Config.networks[chain].rpcUrls[0], Config.networks[chain]);
    this._signer = this._signer.connect(provider);
  }

  public async disconnect(): Promise<void> {
    console.warn("Not implemented!");
  }

}

class WCSigner extends Signer {

  private _address: string;

  ///////////////////
  // Sub-classes MUST implement these

  // Returns the checksum address
  public async getAddress(): Promise<string> {
    return this._address;
  }

  // Returns the signed prefixed-message. This MUST treat:
  // - Bytes as a binary message
  // - string as a UTF8-message
  // i.e. "0x1234" is a SIX (6) byte string, NOT 2 bytes of data
  public async signMessage(message: Bytes | string): Promise<string> {
    const textEncoder = new TextEncoder();
    let bytes: Bytes = typeof message === 'string' ? textEncoder.encode(message) : message;
    const res = await this.signClient.request<any>({
      topic: this.session.topic,
      chainId: `eip155:${await this.chainId()}`,
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sign",
        params:[this._address, hexlify(bytes)]
      } as any
    });
    return res;
  }

  // Signs a transaction and returns the fully serialized, signed transaction.
  // The EXACT transaction MUST be signed, and NO additional properties to be added.
  // - This MAY throw if signing transactions is not supports, but if
  //   it does, sentTransaction MUST be overridden.
  public async signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
    const chainId = await this.chainId();
    const res = await this.signClient.request<any>({
      topic: this.session.topic,
      chainId: `eip155:${chainId}`,
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_signTransaction",
        params:[{
          from: await transaction.from,
          to: await transaction.to,
          data: await transaction.data,
          gasPrice: await transaction.gasPrice ? ethers.BigNumber.from(await transaction.gasPrice).toHexString() : undefined,
          gasLimit: await transaction.gasLimit ? ethers.BigNumber.from(await transaction.gasLimit).toHexString() : undefined,
          value: await transaction.value ? ethers.BigNumber.from(await transaction.value).toHexString() : undefined
        }]
      } as any
    });
    return res;
  }

  // Populates all fields in a transaction, signs it and sends it to the network
  async sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    const chainId = await this.chainId();
    const hash = await this.signClient.request<any>({
      topic: this.session.topic,
      chainId: `eip155:${chainId}`,
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "eth_sendTransaction",
        params:[{
          from: await transaction.from,
          to: await transaction.to,
          data: await transaction.data,
          gasPrice: await transaction.gasPrice ? ethers.BigNumber.from(await transaction.gasPrice).toHexString() : undefined,
          gasLimit: await transaction.gasLimit ? ethers.BigNumber.from(await transaction.gasLimit).toHexString() : undefined,
          value: await transaction.value ? ethers.BigNumber.from(await transaction.value).toHexString() : undefined
        }]
      } as any
    });
    const provider = (this.provider as ethers.providers.JsonRpcProvider);
    const blockNumber = await provider._getInternalBlockNumber(100 + 2 * provider.pollingInterval);
    const res = await poll(async () => {
      const tx = await this.provider.getTransaction(hash);
      if (tx === null) { return undefined; }
      return provider._wrapTransaction(tx, hash, blockNumber);
    }, { oncePoll: this.provider });
    if(!res) throw new Error(`WCSigner: Failed to poll for transaction response: ${hash}`);
    return res;
  }

  // Returns a new instance of the Signer, connected to provider.
  // This MAY throw if changing providers is not supported.
  public connect(provider: Provider): WCSigner {
    return new WCSigner(this.signClient, this.session, provider);
  }

  ///////////////////
  // Constructor

  constructor(private signClient: SignClient, private session: SessionTypes.Struct, readonly provider: Provider) {
    super();
    this._address = ((session.namespaces["eip155"].accounts[0] ?? "").match(/eip155:1:(.+)/) ?? [])[1] ?? null;
  }

  private async chainId() {
    return (await this.provider.getNetwork()).chainId;
  }

}