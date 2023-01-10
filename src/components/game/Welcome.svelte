<!-- Component -->
<script type="ts">
  import { onMount, onDestroy } from "svelte";
  import { push } from "svelte-spa-router";
  import { connect } from "../ConnectOverlay.svelte";
  import { gameUI } from "./Game.svelte";

  // Lifecycle:
  onMount(() => {
    gameUI.push({
      menu: {
        components: [],
        index: 0
      },
      buttons: {
        left: { title: "-", class: "icofont-minus", action: () => null },
        middle: { title: "connect", class: "icofont-wallet", action: () => connect().catch(console.error) },
        right: { title: "about", class: "icofont-question", action: () => push("/about") }
      }
    });
  });
  onDestroy(() => {
    gameUI.pop();
  });
</script>

<!-- Content -->
<div id="container">
  <h3>Welcome!</h3>
  <img id="welcome-pooly" src="assets/species/0/neutral.gif" alt="pooly bird standing animation" />
  <p>Connect to hatch a Poolygotchi!</p>
</div>

<!-- Style -->
<style>
  #container {
    position: absolute;
    inset: 0;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    background-color: #0004;
  }

  #welcome-pooly {
    width: calc(var(--game-size) * 0.4);
  }
</style>