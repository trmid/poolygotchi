<!-- Component -->
<script type="ts">
  import { BigNumber, BigNumberish } from "ethers";
  import { onMount } from "svelte";
  import { account, disconnect } from "../../Account.svelte";
  import Poolygotchi from "../../../utils/poolygotchi";
  import { poolygotchi } from "../Game.svelte";
  import PoolTogether from "../../../utils/poolTogether";
  import { networks } from "../../../config";
  import { Notification, pushNotification } from "../../Notifications.svelte";
  import Scene from "../components/Scene.svelte";
  import { buttonController } from "../components/ButtonController.svelte";

  // Pooly Attributes
  let name: string = "";
  let speciesId: BigNumberish = 0;
  let environmentId: BigNumberish = 0;
  let weeklyGoal: number = 100;

  // Constants:
  const maxPage = 3;
  const deviceButtonController = buttonController({
    left: {
      title: "back",
      class: "icofont-arrow-left",
      action: () => back()
    },
    middle: {
      title: "cancel",
      class: "icofont-ui-close",
      action: disconnect
    },
    right: {
      title: "next",
      class: "icofont-arrow-right",
      action: () => next()
    }
  });

  // Variables
  let page = 0;
  let numSpecies: BigNumberish = 3;
  let numEnvironments: BigNumberish = 3;

  // Navigation functions:
  const back = () => {
    if(page > 0) page--;
  };
  const next = () => {
    if(page < maxPage) page++;
  };

  // Species Selectors:
  const prevSpecies = () => {
    speciesId = BigNumber.from(speciesId).sub(1);
    if(speciesId.lt(0)) speciesId = BigNumber.from(numSpecies).sub(1);
  };
  const nextSpecies = () => {
    speciesId = BigNumber.from(speciesId).add(1);
    if(speciesId.gte(numSpecies)) speciesId = 0;
  };

  // Environment Selectors:
  const prevEnvironment = () => {
    environmentId = BigNumber.from(environmentId).sub(1);
    if(environmentId.lt(0)) environmentId = BigNumber.from(numEnvironments).sub(1);
  };
  const nextEnvironment = () => {
    environmentId = BigNumber.from(environmentId).add(1);
    if(environmentId.gte(numEnvironments)) environmentId = 0;
  };

  // Hatch Function:
  async function hatch() {
    try {
      if(!$account) throw new Error("missing account");
      const address = $account.address;
      const hatchTx = await Poolygotchi.contract().populateTransaction.hatch(
        name,
        speciesId,
        environmentId,
        BigNumber.from(Math.floor(weeklyGoal)).mul(10**6),
        await PoolTogether.totalDeposited(address)
      );
      hatchTx.chainId = networks.poolygotchi.chainId;
      const res = await $account.safeSendTransaction(hatchTx);
      await res.wait();
      $poolygotchi = await $account.poolygotchi();
    } catch(err) {
      console.error(err);
      const notification: Omit<Notification, "timestamp"> = {
        message: err instanceof Error ? err.message : "reason unknown",
        type: 'error'
      }; 
      if(notification.message.includes("user rejected transaction")) {
        notification.message = "transaction rejected";
        notification.type = 'warning';
      }
      notification.message = `Failed to hatch: ${notification.message}`;
      pushNotification(notification);
    }
  }

  // On Mount:
  onMount(() => {

    // Get accurate asset counts:
    Poolygotchi.contract().numSpecies().then(num => numSpecies = num).catch(console.error);
    Poolygotchi.contract().numEnvironments().then(num => numEnvironments = num).catch(console.error);

  });

</script>

<!-- Scene -->
<Scene {deviceButtonController}>
  <div id="container">
    {#if page == 0}
      <h3>Choose Your Poolygotchi</h3>
      <div class="column">
        <div class="selector">
          <button on:click={prevSpecies}><i class="icofont-caret-left" /></button>
          <img class="poolygotchi" src="assets/species/{speciesId}/neutral.gif" alt="poolygotchi species {speciesId}">
          <button on:click={nextSpecies}><i class="icofont-caret-right" /></button>
        </div>
        <input id="name-input" type="text" placeholder="Name Tag" maxlength="48" bind:value={name}>
      </div>
    {:else if page == 1}
      <h3>Select Your Environment</h3>
      <div class="selector">
        <button on:click={prevEnvironment}><i class="icofont-caret-left" /></button>
        <img class="environment" src="assets/environments/{environmentId}/environment.png" alt="poolygotchi environment {environmentId}">
        <button on:click={nextEnvironment}><i class="icofont-caret-right" /></button>
      </div>
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
        <button on:click={hatch}>
          <img src="favicon.png" alt="poolygotchi egg">
          Hatch!
        </button>
      </div>
    {/if}
    <div id="page-selector">
      <button on:click={back} class:hidden={page == 0}>back</button>
      <i>Step {page + 1} of 4</i>
      <button on:click={next} class:hidden={page == maxPage}>next</button>
    </div>
  </div>
</Scene>

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

  .selector {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .selector > button {
    font-size: 24px;
    padding: 0;
    min-width: 0;
    width: 32px;
    height: 32px;
  }

  img.poolygotchi {
    display: block;
    width: calc(var(--game-size) * 0.4);
  }

  img.environment {
    display: block;
    width: calc(var(--game-size) * 0.5);
    border-radius: 0.5rem;
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

  #hatch > button > img {
    width: 48px;
    height: 48px;
  }
</style>