import { createIcon } from "@download/blockies";
import { Contract, ethers } from "ethers";
import WeaverFi, { Address } from "weaverfi";
import { providers } from "weaverfi/dist/functions";
import erc721 from "../../solidity/node_modules/@openzeppelin/contracts/build/contracts/ERC721.json";
import { fetchJSON, normalizeImageURI } from "../uri";

export abstract class BaseAccount {
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
    return createIcon({ seed: this.address.toLowerCase() }).toDataURL() as string;
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
  async poolyAvatars(): Promise<string[]> {
    const nftContracts: Record<string, { contract: Address, mime: 'image/png', unique?: boolean }> = {
      supporter: {
        contract: "0x90B3832e2F2aDe2FE382a911805B6933C056D6ed",
        mime: 'image/png',
        unique: true
      },
      lawyer: {
        contract: "0x3545192b340F50d77403DC0A64cf2b32F03d00A9",
        mime: 'image/png'
      },
      judge: {
        contract: "0x5663e3E096f1743e77B8F71b5DE0CF9Dfd058523",
        mime: 'image/png'
      },
      pfer: {
        contract: "0xBCC664B1E6848caba2Eb2f3dE6e21F81b9276dD8",
        mime: 'image/png',
        unique: true,
      }
    };
    const avatars: string[] = [];
    const promises: Promise<any>[] = [];
    for(const key in nftContracts) {
      promises.push(new Promise<void>(async (resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Timeout on fetching of pfp: ${key}`));
        }, 30000);
        try {
          const contract = new Contract(nftContracts[key].contract, erc721.abi, providers.eth[0]);
          const addToken = async (tokenId: ethers.BigNumberish) => {
            const tokenURI = await contract.tokenURI(tokenId);
            const metadata = await fetchJSON(tokenURI);
            avatars.push(await normalizeImageURI(metadata.image, nftContracts[key].mime));
          };
          const balance = await contract.balanceOf(this.address);
          if(balance > 0) {
            if(nftContracts[key].unique) {
              const tokenInFilter = contract.filters.Transfer(null, this.address);
              const tokenInEvents = await contract.queryFilter(tokenInFilter);
              const tokenIdsIn = new Set<string>();
              for(const event of tokenInEvents) {
                if(event.args && event.args["tokenId"]) {
                  tokenIdsIn.add(ethers.BigNumber.from(event.args["tokenId"]).toHexString());
                }
              }
              for(const tokenId of tokenIdsIn) {
                await addToken(ethers.BigNumber.from(tokenId));
              }
            } else {
              await addToken(0);
            }
          }
          resolve();
        } catch(err) {
          reject(err);
        } finally {
          clearTimeout(timeout);
        }
      }).catch(console.error));
    }
    await Promise.allSettled(promises).catch(console.error);
    return avatars;
  }
  async allAvatars(): Promise<{ url: string, weight: number }[]> {

    // Create list of avatars:
    let avatars: { url: string, weight: number }[] = [
      { url: this.defaultAvatar, weight: 0 }
    ];

    // Async fetch all on-chain avatars:
    const promises: Promise<any>[] = [
      this.poolyAvatars().then(res => avatars.push(...res.map(x => ({ url: x, weight: 1 })))).catch(console.error),
      this.ensAvatar().then(res => res && avatars.push({ url: res, weight: 2 })).catch(console.error)
    ];
    await Promise.allSettled(promises);
    
    // Return avatars:
    return avatars.sort((a, b) => b.weight - a.weight);
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

export default interface Account {
  get address(): string
  get avatar(): string
  set avatar(url: string)
  get defaultAvatar(): string
  get storedAvatar(): string | null
  getProvider(chainId: number): Promise<ethers.providers.Provider>
  sign(tx: ethers.providers.TransactionRequest): Promise<string>
  disconnect(): Promise<void>
  ensName(): Promise<string | null>
  ensAvatar(): Promise<string | null>
  poolyAvatars(): Promise<string[]>
  allAvatars(): Promise<{ url: string, weight: number }[]>
}