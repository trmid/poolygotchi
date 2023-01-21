<!-- Module -->
<script type="ts" context="module">
  import { writable } from "svelte/store";
  import type Poolygotchi from "../../utils/poolygotchi";
  import { account } from "../Account.svelte";

  // Exports:
  export const poolygotchi = writable<Poolygotchi | null>(null);

  // Subscribe poolygotchi to account:
  account.subscribe(async account => {
    try {
      if(!account) {
        poolygotchi.set(null);
      } else {
        poolygotchi.set(await account.poolygotchi());
      }
    } catch(err) {
      console.error(err);
      poolygotchi.set(null);
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

  const deviceButtonController = buttonController({
    left: EMPTY_BUTTON,
    middle: EMPTY_BUTTON,
    right: EMPTY_BUTTON
  });
</script>

<!-- Device Container -->
<div id="device">
  <div class="case" />

  <!-- Screen -->
  <Screen>
    {#if $poolygotchi}
      <Home poolygotchi={$poolygotchi} {deviceButtonController} />
    {:else if $account}
      <AccountSetup {deviceButtonController} />
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