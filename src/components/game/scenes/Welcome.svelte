<!-- Component -->
<script type="ts">
  import { push } from "svelte-spa-router";
  import { connect } from "../../ConnectOverlay.svelte";
  import { buttonController } from "../components/ButtonController.svelte";
  import { EMPTY_BUTTON } from "../components/Buttons.svelte";
  import Scene from "../components/Scene.svelte";

  // Constants:
  const deviceButtonController = buttonController({
    left: EMPTY_BUTTON,
    middle: { title: "connect", class: "icofont-wallet", action: () => connect().catch(console.error) },
    right: { title: "about", class: "icofont-question", action: () => push("/about") }
  });

</script>

<!-- Scene -->
<Scene {deviceButtonController}>
  <div id="container">
    <h3>Welcome!</h3>
    <img id="welcome-pooly" src="assets/species/0/neutral.gif" alt="pooly bird standing animation" />
    <p>Connect to hatch a Poolygotchi!</p>
  </div>
</Scene>

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