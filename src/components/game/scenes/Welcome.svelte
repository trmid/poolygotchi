<!-- Component -->
<script type="ts">
  import { push } from "svelte-spa-router";
  import { connect } from "../../ConnectOverlay.svelte";
  import ButtonControllerSvelte from "../components/ButtonController.svelte";
  import type { ButtonController } from "../components/ButtonController.svelte";
  import type { DeviceButtons } from "../components/Buttons.svelte";
  import Speech from "../components/Speech.svelte";

  // Props:
  export let deviceButtonController: ButtonController;

  // Constants:
  const comments = [
    "Welcome!",
    "Ready to play and save?",
    "Let's save money and win prizes with PoolTogether!",
    "Pool together, play together!",
    "You're invited to the pool party!",
  ];
  const buttons: DeviceButtons = {
    left: { title: "Connect", class: "icofont-wallet", action: () => connect().catch(console.error) },
    middle: {
      title: "Interact!",
      class: "icofont-comment",
      action: () => {
        if(happy) clearTimeout(happy);
        happy = setTimeout(() => {
          happy = null;
        }, 2000);
        speech = comments.filter(x => x !== speech)[Math.floor(Math.random() * (comments.length - 1))];
      }
    },
    right: { title: "About", class: "icofont-question", action: () => push("/about") }
  };

  // Variables:
  let speech = comments[0];
  let happy: NodeJS.Timeout | null = null;

</script>

<!-- Device Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Scene -->
<div id="container">
  <Speech {speech} />
  <img id="welcome-pooly" src="assets/species/0/{(happy !== null) ? 'happy' : 'neutral'}.gif" alt="poolygotchi bird animation" />
  <div id="connect-message">Connect to hatch a Poolygotchi!</div>
</div>

<!-- Style -->
<style>
  #container {
    position: absolute;
    inset: 0;
    background-color: #0004;
  }

  #welcome-pooly {
    position: absolute;
    width: calc(var(--game-size) * 0.4);
    left: 50%;
    bottom: 22%;
    transform: translateX(-50%);
  }

  #connect-message {
    position: absolute;
    left: 7%;
    right: 7%;
    bottom: 7%;
    text-align: center;
    font-style: italic;
  }
</style>