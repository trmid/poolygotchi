<!-- Component -->
<script type="ts">
  import { BigNumber, BigNumberish } from "ethers";
  import { account, disconnect } from "../../Account.svelte";
  import Poolygotchi from "../../../utils/poolygotchi";
  import { poolygotchi } from "../Game.svelte";
  import PoolTogether from "../../../utils/poolTogether";
  import { networks } from "../../../config";
  import { pushNotification } from "../../Notifications.svelte";
  import { explorerReceipt, txNotification } from "../../../utils/tx";
  import ButtonControllerSvelte from "../components/ButtonController.svelte";
  import type { ButtonController } from "../components/ButtonController.svelte";
  import type { DeviceButtons } from "../components/Buttons.svelte";
  import EnvironmentSelector from "../components/EnvironmentSelector.svelte";
    import SpeciesSelector from "../components/SpeciesSelector.svelte";

  // Props:
  export let deviceButtonController: ButtonController;

  // Pooly Attributes
  let name: string = "";
  let speciesId: BigNumber = BigNumber.from(0);
  let environmentId: BigNumber = BigNumber.from(0);
  let weeklyGoal: number = 100;

  // Constants:
  const maxPage = 3;
  const buttons: DeviceButtons = {
    left: {
      title: "Back",
      class: "icofont-arrow-left",
      action: () => back()
    },
    middle: {
      title: "Cancel",
      class: "icofont-ui-close",
      action: disconnect
    },
    right: {
      title: "Next",
      class: "icofont-arrow-right",
      action: () => next()
    }
  };

  // Variables
  let page = 0;

  // Navigation functions:
  const back = () => {
    if(page > 0) page--;
  };
  const next = () => {
    if(page < maxPage) page++;
  };

  // Hatch Function:
  let hatching = false;
  async function hatch() {
    let dismissPending: (() => void) | undefined;
    try {
      hatching = true;
      if(!$account) throw new Error("missing account");
      dismissPending = pushNotification({ message: "Hatching your poolygotchi <i class='icofont-custom-spinner'></i>", type: "standard", title: "Hatching...", persist: true });
      await $account.switchChain(networks.poolygotchi.chainId);
      const res = await Poolygotchi.contract().connect($account.signer).hatch(
        name,
        speciesId,
        environmentId,
        BigNumber.from(Math.floor(weeklyGoal)).mul(10**6),
        await PoolTogether.totalDeposited($account.address)
      );
      dismissPending();
      dismissPending = pushNotification({ message: "Waiting for transaction receipt <i class='icofont-custom-spinner'></i>", type: "standard", title: "Transaction Sent", persist: true });
      const receipt = await res.wait();
      dismissPending();
      pushNotification({ message: `Transaction successful!\n\n<a href="${explorerReceipt(networks.poolygotchi.chainId, receipt)}" target="_blank" rel="noreferrer">View Receipt</a>`, type: "success" });
      $poolygotchi = await $account.poolygotchi();
    } catch(err) {
      console.error(err);
      pushNotification(txNotification(err) ?? { message: `Failed to hatch.`, type: "error" });
    } finally {
      dismissPending && dismissPending();
      hatching = false;
    }
  }

</script>

<!-- Device Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Scene -->
<div id="container">
  {#if page == 0}
    <h3>Choose Your Poolygotchi</h3>
    <div class="column">
      <SpeciesSelector bind:speciesId />
      <input id="name-input" type="text" placeholder="Name Tag" maxlength="48" bind:value={name}>
    </div>
  {:else if page == 1}
    <h3>Select Your Environment</h3>
    <EnvironmentSelector bind:environmentId />
  {:else if page == 2}
    <h3>Set Your Goal</h3>
    <div id="goal-num">
      <img src="img/usdc.webp" alt="USDC">
      <input type="number" placeholder="Weekly Savings Goal" bind:value={weeklyGoal}>
      <strong><i>(per week)</i></strong>
    </div>
  {:else if page == 3}
    <h3>Hatch Your Poolygotchi</h3>
    <div id="hatch">
      <button on:click={hatch} disabled={hatching}>
        {#if hatching}
          Hatching...
        {:else}
          <img src="favicon.png" alt="poolygotchi egg">
          Hatch!
        {/if}
      </button>
    </div>
  {/if}
  <div id="page-selector">
    <button on:click={back} class:hidden={page == 0}>back</button>
    <i>Step {page + 1} of 4</i>
    <button on:click={next} class:hidden={page == maxPage}>next</button>
  </div>
</div>

<!-- Style -->
<style>
  #container {
    position: absolute;
    inset: 0;
    padding: 6%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.5rem;
    align-items: stretch;
    background-color: #0004;
  }

  h3 {
    margin: 0;
    font-size: 16px;
  }
  
  .column {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  #page-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem
  }

  #page-selector > button {
    min-width: 0;
    padding: 0.5rem;
  }

  #name-input {
    display: block;
    background: var(--transparent-gradient);
  }

  button.hidden {
    visibility: hidden;
  }

  #goal-num {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  #goal-num > img {
    display: block;
    width: 32px;
    height: 32px;
  }

  #goal-num > input {
    width: 5rem;
  }

  #hatch {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
  }
  
  #hatch > button {
    height: 5rem;
    padding: 1rem 2rem;
    font-size: 24px;
    font-weight: bold;
    background: var(--bg-gradient);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    border-radius: 1rem;
  }

  #hatch > button:disabled {
    filter: grayscale(0.8);
  }

  #hatch > button > img {
    width: 48px;
    height: 48px;
  }
</style>