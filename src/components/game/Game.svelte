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
</script>

<!-- Device Container -->
<div id="device">
  <div class="case" />

  <!-- Scene -->
  {#if $poolygotchi}
    <Home poolygotchi={$poolygotchi} />
  {:else if $account}
    <AccountSetup />
  {:else}
    <Welcome />
  {/if}

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

  @media screen and (min-width: 1024px) {
    #device {
      --game-size: 450px;
    }
  }
</style>