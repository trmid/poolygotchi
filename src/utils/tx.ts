import type { TransactionReceipt } from "@ethersproject/abstract-provider"
import type { Notification } from "../components/Notifications.svelte";
import { networks } from "../config";

export function explorerReceipt(chainId: number, tx: TransactionReceipt) {
  const network = networks[chainId];
  if(!network) throw new Error(`Invalid chainId: ${chainId}`);
  return network.blockExplorerUrls[0] + "tx/" + tx.transactionHash;
}

export function txNotification(err: any) {
  let notification: Omit<Notification, 'timestamp'> | null = null;
  if(err instanceof Error) {
    if(err.message.includes("user rejected transaction")) {
      notification = {
        message: "transaction rejected",
        type: "warning"
      };
    }
  }
  return notification;
}