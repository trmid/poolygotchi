import { ethers } from "ethers";
import { AccountWithSigner, BaseAccount, transactionHasChainId } from ".";
import type { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { Deferrable, resolveProperties } from "ethers/lib/utils";
import { networks } from "../../config";

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

  public async safeSendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    const tx = await resolveProperties(transaction);
    if(transactionHasChainId(tx)) {

      // Switch to chain:
      await this.switchChain(tx.chainId);

      // Send TX:
      return await this.signer.sendTransaction(tx);
    } else {
      throw { ...new Error("Transaction missing chainId"), tx };
    }
  }

  public async switchChain(chain: number) {
    const chainId = await this._signer.getChainId();
    if(chainId != chain) {
      const hexChainId = `0x${chain.toString(16)}`;
      const web3Provider = new ethers.providers.Web3Provider(ethereum, "any");
      try {
        await web3Provider.send('wallet_switchEthereumChain',
          [{ chainId: hexChainId }],
        );
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError && (switchError as any).code === 4902) {
          try {
            if(!(chain in networks)) {
              throw new Error(`Chain, ${chain}, is not supported`);
            }
            const network = networks[chain];
            await web3Provider.send('wallet_addEthereumChain',
              [{ chainName: network.name, chainId: hexChainId, rpcUrls: network.rpcUrls, nativeCurrency: network.nativeCurrency, blockExplorerUrls: network.blockExplorerUrls }],
            );
          } catch (addError) {
            console.error(addError);
          }
        } else {
          console.error(switchError);
        }
      }
      if(await this._signer.getChainId() !== chain) {
        throw new Error(`Not connected to requested chain: ${chain}`);
      }
    }
  }

  public async disconnect(): Promise<void> {
    // nothing needed
  }

}