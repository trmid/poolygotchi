import type { TransactionReceipt } from "@ethersproject/abstract-provider"
import { networks } from "../config";

export function explorerReceipt(chainId: number, tx: TransactionReceipt) {
  const network = networks[chainId];
  if(!network) throw new Error(`Invalid chainId: ${chainId}`);
  return network.blockExplorerUrls[0] + "tx/" + tx.transactionHash;
}