import { BigNumber, PopulatedTransaction, constants as EtherConst, ContractReceipt, Contract, ContractFactory } from "ethers";
import type { TransactionReceipt } from '@ethersproject/abstract-provider/src.ts/index';
import WeaverFi from "weaverfi";;
import { nftABI } from "weaverfi/dist/ABIs";
import type { ABI, Address, Chain } from "weaverfi/dist/types";
import type { MaybePromise } from "../../utils/maybePromise";
import { providers } from "weaverfi/dist/functions";

export interface Account {
  /**
   * Gets the account address
   * @returns Address as string
   */
  get address(): Address
  /**
   * Resolves the ENS name of the account, if any exists
   * @returns ENS name or null
   */
  ensName(): Promise<string | null>
  /**
   * Resolves the ENS avatar as a URL of the account, if any exists
   * @returns image URL or null
   */
  ensAvatar(): Promise<string | null>
  /**
   * Resolves a list of URLs for pooly-related avatars that the account owns
   * @returns array of image URLs or null
   */
  poolyAvatars(): Promise<string[] | null>
  /**
   * Gets the account's preferred or default avatar URL
   * @returns image URL
   */
  getAvatar(): Promise<string>
  /**
   * Sets the user's preferred avatar URL and stores it in localStorage
   * @param url avatar image URL
   */
  setAvatar(url: string): void
  /**
   * Prompts the user to sign and send the given transaction 
   * @param tx transaction to sign and send
   * @returns transaction hash
   */
  sendTX(tx: PopulatedTransaction): Promise<string>
}

export abstract class BaseAccount implements Account {

  // TODO: create constructor that accepts address and ethers Signer object
  // Any wallet that is not made from ethers needs a custom Signer implementation to work with this

  // Override this getter in extensions:
  get address(): Address {
    return EtherConst.AddressZero;
  }
  async ensName(): Promise<string | null> {
    return await WeaverFi.eth.lookupENS(this.address);
  }
  async ensAvatar(): Promise<string | null> {
    const name = await this.ensName();
    if(name) {
      const provider = providers.eth[0];
      const resolver = await provider.getResolver(name);
      const avatar = await resolver?.getAvatar();
      if(avatar) {
        return avatar.url;
      }
    }
    return null;
  }
  async poolyAvatars(): Promise<string[] | null> {

    const nftContracts: Record<string, { contract: Address, uniqueId?: boolean }> = {
      supporter: {
        contract: "0x90B3832e2F2aDe2FE382a911805B6933C056D6ed",
      },
      lawyer: {
        contract: "0x3545192b340F50d77403DC0A64cf2b32F03d00A9"
      },
      judge: {
        contract: "0x5663e3E096f1743e77B8F71b5DE0CF9Dfd058523"
      },
      pfer: {
        contract: "0xBCC664B1E6848caba2Eb2f3dE6e21F81b9276dD8",
        uniqueId: true
      }
    };
    const avatars: string[] = [];
    const promises: Promise<any>[] = [];
    for(const key in nftContracts) {
      promises.push(new Promise(async (resolve, reject) => {
        try {
          const balance = await WeaverFi.eth.query(nftContracts[key].contract, nftABI, "balanceOf", [this.address]);
          if(balance > 0) {
            if(nftContracts[key].uniqueId) {
              const contract = new Contract(nftContracts[key].contract, nftABI, providers.eth[0]);
              const tokenInFilter = contract.filters.Transfer(null, this.address);
              const tokenInEvents = await contract.queryFilter(tokenInFilter);
              const tokenIdsIn = new Set<string>();
              for(const event of tokenInEvents) {
                if(event.args && event.args["tokenId"]) {
                  tokenIdsIn.add(event.args["tokenId"]);
                }
              }
            }
          }
        } catch(err) {
          reject(err);
        }
      }));
    }
    await Promise.allSettled(promises);
    return avatars;
  }
  async getAvatar(): Promise<string> {
    let avatar = localStorage.getItem(`avatar-${this.address}`);
    if(!avatar) {
      avatar = await this.ensAvatar();
    }
    if(!avatar) {
      avatar = (await this.poolyAvatars() ?? [])[0];
    }
    if(!avatar) {
      avatar = "favicon.png";
    }
    this.setAvatar(avatar);
    return avatar;
  }
  setAvatar(url: string) {
    localStorage.setItem(`avatar-${this.address}`, url);
  }
  // Default sendTX with no functionality:
  sendTX(tx: PopulatedTransaction): Promise<string> {
    throw new Error("cannot sendTX from abstract Account function");
  }

}