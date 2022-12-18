<!-- Module -->
<script type="ts" context="module">
  import { get, writable } from "svelte/store";
  import { account } from "./Account.svelte";
  import type Account from "../utils/account";
  export let resolveConnection: (account: Account) => void;
  export let stopConnecting: (err: string | Error) => void;
  export let connectionPromise = writable<Promise<Account> | null>(null);
  export const connect = () => {
    let promise = get(connectionPromise);
    if(!promise) {
      promise = new Promise((resolve, reject) => {
        resolveConnection = (connected: Account) => {
          account.set(connected);
          if(get(connectionPromise)) {
            connectionPromise.set(null);
            resolve(connected);
          }
        };
        stopConnecting = (err: string | Error) => {
          if(get(connectionPromise)) {
            console.log("Setting null");
            connectionPromise.set(null);
            reject(err instanceof Error ? err : new Error(err));
          }
        };
      });
      connectionPromise.set(promise);
    }
    return promise;
  };
  export const injectedSynced = writable(false);
</script>

<!-- Component -->
<script type="ts">
  import Overlay from "./Overlay.svelte";
  import SignClient from "@walletconnect/sign-client";
  import { W3mModal } from "@web3modal/ui";
  import { Web3Modal } from "@web3modal/standalone";
  import { onDestroy } from "svelte";
  import WCAccount from "../utils/account/wc";
  import { ethers } from "ethers";
  import InjectedAccount from "../utils/account/injected";
  import ConnectOption from "./ConnectOption.svelte";
  if(!W3mModal) throw new Error("Missing W3mModal import! This is necessary for rollup iife bundle creation.");

  // Function to Close Overlay:
  const close = () => {
    stopConnecting("closed by user");
  };

  // Wallet Connect:
  const walletConnectProjectId = "7e6fcc227cb1599585bb33cb400e6bf9";
  const chainList = ["eip155:1", "eip155:10", "eip155:137", "eip155:43114"];
  const web3Modal = new Web3Modal({
    projectId: walletConnectProjectId,
    standaloneChains: chainList,
    themeColor: "blue",
    themeBackground: "themeColor"
  });
  let signClientWC: SignClient | null = null;
  const connectWC = async () => {
    if(!signClientWC) {
      signClientWC = await SignClient.init({
        projectId: walletConnectProjectId
      });
      signClientWC.on("session_event", (event) => {
        // Handle session events, such as "chainChanged", "accountsChanged", etc.
        console.log(event);
      });
      signClientWC.on("session_update", ({ topic, params }) => {
        try {
          const { namespaces } = params;
          const _session = signClientWC?.session.get(topic);
          // Overwrite the `namespaces` of the existing session with the incoming one.
          const updatedSession = { ..._session, namespaces };
          console.log("Updated Session: ", updatedSession);
        } catch(err) {
          console.warn("Error during session_update for topic: ", topic);
          console.error(err);
        }
      });
      signClientWC.on("session_delete", () => {
        console.log("Session Deleted!");
        // Session was deleted -> reset the dapp state, clean up from user session, etc.
        if($account instanceof WCAccount) {
          $account = null;
        }
      });
    }
    const { uri, approval } = await signClientWC.connect({
      requiredNamespaces: {
        eip155: {
          methods: [
            "eth_sendTransaction",
            "eth_signTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTypedData",
          ],
          chains: chainList,
          events: ["chainChanged", "accountsChanged"],
        },
      },
    });
    try {
      if (uri) {
        web3Modal.openModal({ uri, standaloneChains: chainList });
      } else {
        throw new Error("no URI provided...");
      }
      const session = await approval();
      console.log(session);
      resolveConnection(new WCAccount(signClientWC, session));
    } catch(err) {
      console.error(err);
    } finally {
      web3Modal.closeModal();
    }
  };

  // Injected Wallet:
  const connectInjected = async () => {
    if(typeof (window as any)["ethereum"] === "undefined") {
      throw new Error("missing ethereum interface on window");
    }
    const web3Provider = new ethers.providers.Web3Provider(ethereum, "any");
    await web3Provider.send("eth_requestAccounts", []);
    const signer = web3Provider.getSigner();
    // if (await signer.getChainId() != network.chainId) {
    //   const hexChainId = `0x${network.chainId.toString(16)}`;
    //   try {
    //     await web3Provider.send('wallet_switchEthereumChain',
    //       [{ chainId: hexChainId }],
    //     );
    //   } catch (switchError) {
    //     // This error code indicates that the chain has not been added to MetaMask.
    //     if ((<any>switchError).code === 4902) {
    //       try {
    //         await web3Provider.send('wallet_addEthereumChain',
    //           [{ chainName: network.name, chainId: hexChainId, rpcUrls: network.rpcUrls, nativeCurrency: network.nativeCurrency, blockExplorerUrls: network.blockExplorerUrls }],
    //         );
    //       } catch (addError) {
    //         console.error(addError);
    //       }
    //     } else {
    //       console.error(switchError);
    //     }
    //   }
    //   throw new Error("Not connected to Avalanche Chain...");
    // }
    resolveConnection(new InjectedAccount(signer, await signer.getAddress()));
    // Also check if we are synced with the network and signer changes:
    if(!$injectedSynced) {
      try {
        // Update signer on account change:
        ethereum.on("accountsChanged", async () => {
          if($account instanceof InjectedAccount) {
            $account?.disconnect();
            await connectInjected().catch(console.error);
          }
        });
        // Reload page on network change:
        // const provider = new ethers.providers.JsonRpcProvider(network.rpcUrls[0], network);
        // provider.on("network", (newNetwork, oldNetwork) => {
        //   // When a Provider makes its initial connection, it emits a "network"
        //   // event with a null oldNetwork along with the newNetwork. So, if the
        //   // oldNetwork exists, it represents a changing network
        //   if (oldNetwork) {
        //     location.reload();
        //   }
        // });
        $injectedSynced = true;
      } catch(err) {
        console.error(err);
      }
    }
  };

  // On Destroy:
  onDestroy(() => {
    web3Modal.closeModal();
  });
</script>

{#if $connectionPromise}
<Overlay width={300} {close}>
  <h3>connect</h3>
  <ConnectOption name="Injected" onClick={() => {connectInjected().catch(console.error);}}>
    <i class="icofont-wallet" slot="logo" style:font-size="32px"/>
  </ConnectOption>
  <ConnectOption name="Wallet Connect" onClick={() => {connectWC().catch(console.error);}}>
    <img src="img/wc_logo.svg" alt="" slot="logo">
  </ConnectOption>
</Overlay>
{/if}