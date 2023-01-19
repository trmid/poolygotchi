
const _parsed: Record<string, any> = {};

// Storage to get and save prize info for a given address:
export namespace PrizeInfo {

  export interface PrizeInfo {
    chainId: number
    lastDrawChecked: number
    unclaimed: number[]
  }

  const keyOf = (address: string, chainId: number) => `prizeInfo:${chainId}:${address.toLowerCase()}`;

  export const get = (address: string, chainId: number) => {
    const key = keyOf(address, chainId);
    let info: PrizeInfo | null = _parsed[key] ?? JSON.parse("" + localStorage.getItem(key));
    if(info) {
      if(!(
        ("chainId" in info) &&
        (typeof info.chainId === "number") &&
        ("lastDrawChecked" in info) &&
        (typeof info.lastDrawChecked === "number") &&
        ("unclaimed" in info) &&
        (typeof info.unclaimed === "object") &&
        (Array.isArray(info.unclaimed)) &&
        (info.unclaimed.forEach(x => {
          if(typeof x !== "number") info = null;
        }), info)
      )) {
        localStorage.removeItem(key);
        delete _parsed[key];
        info = null;
      }
    }
    if(info) {
      _parsed[key] = info;
    }
    return info;
  };

  export const set = (address: string, prizeInfo: PrizeInfo) => {
    const key = keyOf(address, prizeInfo.chainId);
    _parsed[key] = prizeInfo;
    localStorage.setItem(key, JSON.stringify(prizeInfo));
  };

}

// Storage to get and save ens name resolutions:
export namespace ENSName {
  const keyOf = (address: string) => `ens:name:${address.toLowerCase()}`;
  export const get = (address: string) => localStorage.getItem(keyOf(address));
  export const set = (address: string, name: string) => localStorage.setItem(keyOf(address), name);
}

// Storage to get and save avatar resolutions:
export namespace StoredAvatar {
  const keyOf = (address: string) => `avatar:${address.toLowerCase()}`;
  export const get = (address: string) => localStorage.getItem(keyOf(address));
  export const set = (address: string, name: string) => localStorage.setItem(keyOf(address), name);
}