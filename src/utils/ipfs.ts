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