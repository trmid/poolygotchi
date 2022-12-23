import type IPFSTypes from 'ipfs-core';

let ipfsPromise: Promise<IPFSTypes.IPFS> | undefined;
let ipfs: IPFSTypes.IPFS | undefined;

export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

export const ipfsClient = async () => {
  if(ipfs) return ipfs;
  if(!ipfsPromise) {
    ipfsPromise = IpfsCore.create().then((res: IPFSTypes.IPFS) => { ipfs = res; return ipfs; }) as Promise<IPFSTypes.IPFS>;
  }
  return await ipfsPromise;
};

const cidQueue: string[] = [];
let preloadingCID: string | null = null;
export const preloadCID = (cid: string) => {
  if(!preloadingCID) {
    preloadingCID = cid;
    console.log(`Preloading CID: ${cid}`);
    ipfsClient()
      .then(ipfs => ipfs.add(cid))
      .then(res => console.log(res))
      .catch(console.error)
      .finally(() => {
        preloadingCID = null;
        console.log(`Done preloading: ${cid}`);
        const nextCID = cidQueue.shift();
        if(nextCID) preloadCID(nextCID);
      });
  } else {
    cidQueue.push(cid);
  }
};