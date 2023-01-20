<script type="ts">
  import { fade } from "svelte/transition";
  import ButtonControllerSvelte from "./ButtonController.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import { DeviceButtons, EMPTY_BUTTON } from "./Buttons.svelte";
  import EnvironmentSelector from "./EnvironmentSelector.svelte";
  import { BigNumber } from "ethers";
  import { poolygotchi } from "../Game.svelte";
  import { pushNotification } from "../../Notifications.svelte";
  import { account } from "../../Account.svelte";
  import Poolygotchi from "../../../utils/poolygotchi";
  import { explorerReceipt, txNotification } from "../../../utils/tx";
  import { Config } from "../../../config";

  // Props:
  export let deviceButtonController: ButtonController;
  export let close: () => void;

  // Variables:
  let currentId = BigNumber.from(0);
  let newId = BigNumber.from(0);
  let carousel: EnvironmentSelector;

  // Reactive data updates:
  $: $poolygotchi?.data().then(data => {
    currentId = data.environmentId;
  }).catch(console.error);

  // Device Buttons:
  let buttons: DeviceButtons;
  $: buttons = {
    left: { title: "Back", class: "icofont-undo", action: close },
    middle: { title: "Next", class: "icofont-caret-right", action: carousel?.next ?? (() => null) },
    right: (currentId.eq(newId) || saving) ? EMPTY_BUTTON : { title: "Save", class: "icofont-save", action: save }
  };

  // Function to save the environment:
  let saving = false;
  const save = async () => {
    let dismissPending: (() => void) | undefined;
    try {
      saving = true;
      if(!$account) throw new Error("Not connected!");
      dismissPending = pushNotification({ message: "Waiting for transaction approval <i class='icofont-custom-spinner'></i>", type: "standard", title: "Updating Environment", persist: true });
      const chainId = Config.networks.poolygotchi.chainId;
      await $account.switchChain(chainId);
      const res = await Poolygotchi.contract().connect($account.signer).setEnvironment(newId);
      dismissPending();
      dismissPending = pushNotification({ message: "Waiting for transaction receipt <i class='icofont-custom-spinner'></i>", type: "standard", title: "Updating Environment", persist: true });
      const receipt = await res.wait(Config.confirmations);
      dismissPending();
      pushNotification({ message: `Environment Updated!\n\n<a href="${explorerReceipt(chainId, receipt)}" target="_blank" rel="noreferrer">View Receipt</a>`, type: "success",  });
      $poolygotchi = await $account.poolygotchi();
    } catch(err) {
      console.error(err);
      pushNotification(txNotification(err) ?? { message: "Failed to save environment.", type: "error" });
    } finally {
      dismissPending && dismissPending();
      saving = false;
    }
  };

</script>

<!-- Device Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Container -->
<div id="container" transition:fade={{ duration: 250 }}>

  <!-- Title -->
  <h3>Environment</h3>

  <!-- Environment Selector -->
  <EnvironmentSelector bind:this={carousel} bind:environmentId={newId} highlightId={currentId} />

  <!-- Buttons -->
  <div id="buttons">

    <!-- Back Button -->
    <button class="game-ui" on:click={close}>
      <i class="icofont-undo colored" />
      back
    </button>

    <!-- Update Button -->
    <button class="game-ui" on:click={save} disabled={saving || newId.eq(currentId)}>
      <i class="icofont-save colored" />
      save
    </button>

  </div>

</div>

<!-- Style -->
<style>
  #container {
    background-color: #0006;
    position: absolute;
    inset: 0;
    padding: 6%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  h3 {
    margin: 0;
  }

  #buttons {
    display: flex;
    justify-content: space-between;
  }
</style>