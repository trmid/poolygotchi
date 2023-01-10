<script type="ts">
  import { onMount, onDestroy } from "svelte";
  import { gameUI } from "./Game.svelte";

  // Exports:
  export let speech: string;
  export let close: () => void;

  // Variables:
  let written = "";
  let timer: NodeJS.Timer | null = null;

  // Reactions:
  $: speech, reset();

  // Functions:
  const reset = () => {
    written = "";
    if(timer) clearInterval(timer);
    timer = setInterval(() => {
      if(written.length == speech.length) {
        (timer !== null) && clearInterval(timer);
      } else {
        written += speech[written.length];
      }
    }, 50);
  };

  // On Mount:
  onMount(() => {
    gameUI.push({
      menu: {
        components: [],
        index: 0
      },
      buttons: {
        left: { title: "-", class: "icofont-minus", action: () => null },
        middle: { title: "Acknowledge", class: "icofont-ui-check", action: close },
        right: { title: "-", class: "icofont-minus", action: () => null },
      }
    });
  });

  // On Destroy:
  onDestroy(() => {
    gameUI.pop();
  });
</script>

<!-- Content -->
<div id="speech-bubble">
  <div class="moving-gradient" />
  <div class="text">
    <span>{written}</span>
  </div>
</div>

<!-- Style -->
<style>
  #speech-bubble {
    position: absolute;
    top: 7%;
    left: 7%;
    right: 7%;
  }

  #speech-bubble > .text {
    position: relative;
    inset: 0;
    background-color: var(--c3);
    color: #222;
    padding: 1rem;
    border: 3px solid var(--c0);
    border-radius: 1rem;
    text-align: left;
  }

  #speech-bubble > .text > span {
    display: inline-block;
    min-height: 1rem;
  }

  #speech-bubble > .moving-gradient {
    position: absolute;
    inset: -3px;
    background-color: var(--c3);
    border-radius: 1rem;
    overflow: hidden;
  }

  #speech-bubble > .moving-gradient::after {
    --size: calc(1.2 * var(--game-size));
    content: "";
    position: absolute;
    left: calc(50% - 0.5 * var(--size));
    top: calc(50% - 0.5 * var(--size));
    width: var(--size);
    height: var(--size);
    background-color: var(--c3);
    background: var(--tri-gradient);
    border-radius: 1rem;
    animation-name: spin;
    animation-duration: 3s;
    animation-play-state: running;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  #speech-bubble::after {
    content: "";
    position: absolute;
    left: 2rem;
    width: 20px;
    height: 20px;
    bottom: -11px;
    border-radius: 0 0 5px 0;
    border-right: 3px solid var(--c0);
    border-bottom: 3px solid var(--c0);
    background-color: var(--c3);
    transform: rotate(45deg);
  }
</style>