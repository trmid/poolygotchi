<!-- Module -->
<script type="ts" context="module">
  import { writable } from "svelte/store";
  import type Poolygotchi from "../../utils/poolygotchi";
  import { account } from "../Account.svelte";

  // Exports:
  export const resolvingPoolygotchi = writable<boolean>(true);
  export const poolygotchi = writable<Poolygotchi | null>(null);

  // Subscribe poolygotchi to account:
  let currentAccount: AccountWithSigner | null;
  account.subscribe(async account => {
    try {
      if(!account) {
        currentAccount = null;
        resolvingPoolygotchi.set(false);
        poolygotchi.set(null);
      } else {

        // Only update if we actually switched accounts, not just modified the object
        if(!currentAccount || (account.address !== currentAccount.address)) {
          currentAccount = account;
          resolvingPoolygotchi.set(true);
          poolygotchi.set(await account.poolygotchi());
          resolvingPoolygotchi.set(false);
        }
      }
    } catch(err) {
      console.error(err);
      poolygotchi.set(null);
      resolvingPoolygotchi.set(false);
    }
  });
</script>

<!-- Component -->
<script type="ts">
  import Home from "./scenes/Home.svelte";
  import Welcome from "./scenes/Welcome.svelte";
  import AccountSetup from "./scenes/AccountSetup.svelte";
  import Buttons, { EMPTY_BUTTON } from "./components/Buttons.svelte";
  import { buttonController } from "./components/ButtonController.svelte";
  import Screen from "./components/Screen.svelte";
  import type { AccountWithSigner } from "../../utils/account";

  const deviceButtonController = buttonController({
    left: EMPTY_BUTTON,
    middle: EMPTY_BUTTON,
    right: EMPTY_BUTTON
  });

  let currentAccount = $account;
  $: $account, checkAccountChange();
  const checkAccountChange = () => {
    if($account) {

      // Only update if we actually switched accounts, not just modified the object
      if(!currentAccount || ($account.address !== currentAccount.address)) {
        currentAccount = $account;
      }
    } else {
      currentAccount = null;
    }
  };
</script>

<!-- Device Container -->
<div id="device">
  <div class="case" />

  <!-- Screen -->
  <Screen>
    {#if $account}
      {#if $resolvingPoolygotchi}
        <div id="spinner">
          <img src="img/spinner.svg" alt="loading...">
        </div>
      {:else}
        {#if $poolygotchi}
          <Home poolygotchi={$poolygotchi} {deviceButtonController} />
        {:else}
          <AccountSetup {deviceButtonController} />
        {/if}
      {/if}
    {:else}
      <Welcome {deviceButtonController} />
    {/if}
  </Screen>

  <!-- Buttons -->
  <Buttons buttons={$deviceButtonController} />

</div>

<!-- Style -->
<style>
  #device {
    --game-size: 300px;
    width: var(--game-size);
    position: relative;
    margin: 1rem 0;
  }

  #device > .case {
    position: absolute;
    z-index: -1;
    background-color: var(--c0);
    background: linear-gradient(0deg, #0000 5%, #fff2 40%, #fff2 60%, #0000 95%);
    border-radius: 50%;
    top: -30%;
    bottom: -15%;
    left: -35%;
    right: -35%;
  }

  #spinner {
    position: absolute;
    inset: 0;
    background-color: var(--c0);
    background: var(--bg-gradient);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #spinner > img {
    width: 150px;
    height: 150px;
    max-width: calc(0.7 * var(--game-size));
    max-height: calc(0.7 * var(--game-size));
  }

  @media screen and (min-width: 390px) {
    #device {
      --game-size: 360px;
    }
  }

  @media screen and (min-width: 600px) {
    #device {
      --game-size: 450px;
    }
  }
</style>