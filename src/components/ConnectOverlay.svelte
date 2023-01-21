<!-- Module -->
<script type="ts" context="module">
  import { get, writable } from "svelte/store";
  import { account } from "./Account.svelte";
  import type { AccountWithSigner } from "../utils/account";
  import { pushNotification } from "./Notifications.svelte";
  import { shortAddress } from "./Address.svelte";

  export let resolveConnection: (account: AccountWithSigner) => void;
  export let stopConnecting: (err: string | Error) => void;
  export let connectionPromise = writable<Promise<AccountWithSigner> | null>(null);
  export const connect = () => {
    let promise = get(connectionPromise);
    if(!promise) {
      promise = new Promise((resolve, reject) => {
        resolveConnection = (connected: AccountWithSigner) => {
          account.set(connected);
          if(get(connectionPromise)) {
            connectionPromise.set(null);
            resolve(connected);
            pushNotification({
              message: `<strong>Connected account:</strong> ${shortAddress(connected.address)}`,
              type: "success"
            });
          }
        };
        stopConnecting = (err: string | Error) => {
          if(get(connectionPromise)) {
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
  import { onDestroy, onMount } from "svelte";
  import WCAccount from "../utils/account/wc";
  import { ethers } from "ethers";
  import InjectedAccount from "../utils/account/injected";
  import ConnectOption from "./ConnectOption.svelte";
  if(!W3mModal) throw new Error("Missing W3mModal import! This is necessary for rollup iife bundle creation.");

  // Variables:
  let injectedAvailable = true;

  // Function to Close Overlay:
  const close = () => {
    stopConnecting("closed by user");
  };

  // Wallet Connect:
  const walletConnectProjectId = "6091c818213d395ed7d3b61e97bd180f";
  const chainList = ["eip155:1", "eip155:10", "eip155:137", "eip155:43114", "eip155:420"];
  const web3Modal = new Web3Modal({
    projectId: walletConnectProjectId,
    standaloneChains: chainList,
    themeColor: "blue",
    themeBackground: "themeColor"
  });
  web3Modal.subscribeModal(({open}) => web3ModalOpen = open);
  let web3ModalOpen = false;
  let signClientWC: SignClient | null = null;
  const connectWC = async () => {
    for(let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if(key && key.startsWith('wc@2')) localStorage.removeItem(key);
    }
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
        $injectedSynced = true;
      } catch(err) {
        console.error(err);
      }
    }
  };

  // On Mount:
  onMount(() => {
    if(!("ethereum" in window)) {
      injectedAvailable = false;
    }
  });

  // On Destroy:
  onDestroy(() => {
    web3Modal.closeModal();
  });
</script>

{#if $connectionPromise && !web3ModalOpen}
<Overlay width={300} {close}>
  <h3>connect</h3>
  <ConnectOption name="Injected" disabled={!injectedAvailable} onClick={() => {connectInjected().catch(console.error);}}>
    <i class="icofont-wallet" slot="logo" style:font-size="32px"/>
  </ConnectOption>
  <ConnectOption name="Wallet Connect" onClick={() => {connectWC().catch(console.error);}}>
    <img src="img/wc_logo.svg" alt="" slot="logo">
  </ConnectOption>
</Overlay>
{/if}