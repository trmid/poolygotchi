import { createIcon } from "@download/blockies";
import type { Signer } from "@ethersproject/abstract-signer";
import { Contract, ethers } from "ethers";
import type { Deferrable } from "ethers/lib/utils";
import WeaverFi, { Address } from "weaverfi";
import { providers } from "weaverfi/dist/functions";
import erc721 from "../../solidity/node_modules/@openzeppelin/contracts/build/contracts/ERC721.json";
import Poolygotchi from "../poolygotchi";
import { fetchJSON, normalizeImageURI } from "../uri";
import type { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";

export abstract class BaseAccount implements Account {
  private _resolvedAvatars: Promise<{ url: string | (() => Promise<string>), category: string, weight: number }[]> | undefined;
  constructor(private _address: string) { }
  get address() {
    return this._address;
  }
  get avatar() {
    return this.storedAvatar ?? this.defaultAvatar;
  }
  set avatar(url: string) {
    localStorage.setItem(`avatar:${this.address.toLowerCase()}`, url);
  }
  get defaultAvatar() {
    return createIcon({ seed: this.address.toLowerCase(), scale: 8 }).toDataURL() as string;
  }
  get storedAvatar() {
    const storageID = `avatar:${this.address.toLowerCase()}`;
    return localStorage.getItem(storageID);
  }
  ensName() {
    return BaseAccount.ensName(this.address);
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
  async poolyAvatars(): Promise<{ url: (() => Promise<string>), category: string }[]> {
    const nftContracts: Record<string, { contract: Address, category: string, unique?: boolean }> = {
      supporter: {
        contract: "0x90B3832e2F2aDe2FE382a911805B6933C056D6ed",
        category: "Pooly - Supporter",
        unique: true
      },
      lawyer: {
        contract: "0x3545192b340F50d77403DC0A64cf2b32F03d00A9",
        category: "Pooly - Lawyer"
      },
      judge: {
        contract: "0x5663e3E096f1743e77B8F71b5DE0CF9Dfd058523",
        category: "Pooly - Judge"
      },
      pfer: {
        contract: "0xBCC664B1E6848caba2Eb2f3dE6e21F81b9276dD8",
        category: "Pooly - pfer",
        unique: true
      }
    };
    const avatarPromises: { url: () => Promise<string>, category: string}[] = [];
    const promises: Promise<any>[] = [];
    for(const key in nftContracts) {
      promises.push((async () => {
        const contract = new Contract(nftContracts[key].contract, erc721.abi, providers.eth[0]);
        const addToken = (tokenId: ethers.BigNumberish) => {
          avatarPromises.push({ url: () => (async () => {
            const tokenURI = await contract.tokenURI(tokenId);
            const metadata = await fetchJSON(tokenURI);
            const url = await normalizeImageURI(metadata.image);
            return url;
          })(), category: nftContracts[key].category });
        };
        const balance = await contract.balanceOf(this.address);
        if(balance > 0) {
          if(nftContracts[key].unique) {
            const tokenInFilter = contract.filters.Transfer(null, this.address);
            const tokenOutFilter = contract.filters.Transfer(this.address, null);
            const tokenInEvents = await contract.queryFilter(tokenInFilter);
            const tokenOutEvents = await contract.queryFilter(tokenOutFilter);
            const sequentialTransfers = tokenInEvents.concat(tokenOutEvents);
            if(sequentialTransfers.length > 1) {
              sequentialTransfers.sort((a,b) => a.blockNumber - b.blockNumber);
            }
            const tokenIds = new Set<string>();
            const lowerCaseAddress = this.address.toLowerCase();
            for(let i = 0; i < sequentialTransfers.length; i++) {
              const event = sequentialTransfers[i];
              if(event.args && event.args["tokenId"] && event.args["to"] && event.args["from"]) {
                const tokenId = ethers.BigNumber.from(event.args["tokenId"]).toHexString();
                if(event.args["to"].toLowerCase() === lowerCaseAddress)
                  tokenIds.add(tokenId);
                else if(event.args["from"].toLowerCase() === lowerCaseAddress)
                  tokenIds.delete(tokenId);
              }
            }
            for(const tokenId of tokenIds) {
              addToken(ethers.BigNumber.from(tokenId));
            }
          } else {
            addToken(0);
          }
        }
      })());
    }
    await Promise.allSettled(promises).catch(console.error);
    return avatarPromises;
  }
  allAvatars(): Promise<{ url: string | (() => Promise<string>), category: string, weight: number }[]> {
    if(!this._resolvedAvatars) {
      this._resolvedAvatars = new Promise(async (resolve) => {
        // Create list of avatars:
        let avatars: { url: string | (() => Promise<string>), category: string, weight: number }[] = [
          { url: this.defaultAvatar, category: "Blockies", weight: 0 }
        ];

        // Async fetch all on-chain avatars:
        const promises: Promise<any>[] = [
          this.poolyAvatars().then(res => avatars.push(...res.map(x => ({ ...x, weight: 1 })))).catch(console.error),
          this.ensAvatar().then(res => res && avatars.push({ url: res, category: "ENS - Avatar", weight: 2 })).catch(console.error)
        ];
        await Promise.allSettled(promises);
        
        // Return avatars:
        resolve(avatars.sort((a, b) => b.weight - a.weight));
      });
    }
    return this._resolvedAvatars;
  }
  async poolygotchi(): Promise<Poolygotchi | null> {
    if(await Poolygotchi.contract().hasPoolygotchi(this.address)) {
      return new Poolygotchi(this.address);
    } else {
      return null;
    }
  }

  /* Static functions */
  static async ensName(address: string, { useCache = false } = {}) {
    const cacheKey = `ens-name-${address.toLowerCase()}`;
    const promise = WeaverFi.eth.lookupENS(address as Address).then(name => {
      if(name) {
        localStorage.setItem(cacheKey, name);
      }
      return name;
    });
    if(useCache) {
      const name = localStorage.getItem(cacheKey);
      if(name) return name;
    }
    return await promise;
  }

}

export interface Account {
  get address(): string
  get avatar(): string
  set avatar(url: string)
  get defaultAvatar(): string
  get storedAvatar(): string | null
  ensName(): Promise<string | null>
  ensAvatar(): Promise<string | null>
  poolyAvatars(): Promise<{ url: (() => Promise<string>), category: string }[]>
  allAvatars(): Promise<{ url: string | (() => Promise<string>), category: string, weight: number }[]>
  poolygotchi(): Promise<Poolygotchi | null>
}

export interface AccountWithSigner extends Account {
  get signer(): Signer
  switchChain(chain: number): Promise<void>
  disconnect(): Promise<void>
}

export function transactionHasChainId(tx: TransactionRequest): tx is TransactionRequest & { chainId: number } {
  return tx.chainId !== undefined;
}