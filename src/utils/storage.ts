
const _parsed: Record<string, any> = {};

// Storage to get and save prize info for a given address:
export namespace PrizeInfo {

  export interface PrizeInfo {
    chainId: number
    checkedIds: number[]
    unclaimed: number[]
    timestamp: number
  }

  const ttl = 1000 * 60 * 60 * 24 * 30; // 30 days
  const keyOf = (address: string, chainId: number) => `prizeInfo:${chainId}:${address.toLowerCase()}`;

  export const get = (address: string, chainId: number) => {
    const key = keyOf(address, chainId);
    let info: PrizeInfo | null = _parsed[key] ?? JSON.parse("" + localStorage.getItem(key));
    if(info) {
      if(!(
        ("chainId" in info) &&
        (typeof info.chainId === "number") &&
        ("checkedIds" in info) &&
        (typeof info.checkedIds === "object") &&
        ("unclaimed" in info) &&
        (typeof info.unclaimed === "object") &&
        ("timestamp" in info) &&
        (typeof info.timestamp === "number") &&
        (Date.now() - info.timestamp < ttl) &&
        (Array.isArray(info.checkedIds)) &&
        (info.checkedIds.forEach(x => {
          if(typeof x !== "number") info = null;
        }), info) &&
        (Array.isArray(info.unclaimed)) &&
        (info.unclaimed.forEach(x => {
          if(typeof x !== "number") info = null;
        }), info)
      )) {
        console.log(info);
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

  export const set = (address: string, prizeInfo: Omit<PrizeInfo, "timestamp">) => {
    const key = keyOf(address, prizeInfo.chainId);
    const withTimestamp = { ...prizeInfo, timestamp: Date.now() };
    _parsed[key] = withTimestamp;
    localStorage.setItem(key, JSON.stringify(withTimestamp));
  };

}

// Storage to get and save prize alert state:
export namespace PrizeAlert {
  const keyOf = (address: string, chainId: number) => `prizeAlert:${chainId}:${address}`;
  const hash = (drawIds: number[]) => {
    let hash = 0;
    const sorted = drawIds.sort();
    for(let i = 0; i < sorted.length; i++) {
      hash ^= sorted[i];
    }
    return hash;
  };
  export const hasNewPrizes = (address: string, chainId: number) => {
    const unclaimed = PrizeInfo.get(address, chainId)?.unclaimed ?? [];
    const lastHash = JSON.parse(""+localStorage.getItem(keyOf(address, chainId))) as number | null;
    const drawHash = hash(unclaimed);
    return drawHash !== lastHash;
  }
  export const update = (address: string, chainId: number) => {
    const unclaimed = PrizeInfo.get(address, chainId)?.unclaimed ?? [];
    localStorage.setItem(keyOf(address, chainId), ""+hash(unclaimed));
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