<script type="ts">
  import { fly } from "svelte/transition";
  import ButtonControllerSvelte from "./ButtonController.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import type { DeviceButtons } from "./Buttons.svelte";

  // Exports:
  export let speech: string;
  export let deviceButtonController: ButtonController;
  export let close: () => void;

  // Constants:
  const buttons: DeviceButtons = {
    left: { title: "No Action", class: "icofont-minus", action: () => null },
    middle: { title: "Acknowledge", class: "icofont-ui-check", action: close },
    right: { title: "No Action", class: "icofont-minus", action: () => null },
  };

  // Variables:
  let written = "";
  let timer: NodeJS.Timer | null = null;
  let bubble: HTMLDivElement | undefined;
  let bubbleWidth = 300;
  let bubbleHeight = 60;

  // Reactions:
  $: speech, reset();
  $: written, getBubbleSize();

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

  const getBubbleSize = () => {
    if(bubble) {
      const bb = bubble.getBoundingClientRect();
      bubbleWidth = bb.width;
      bubbleHeight = bb.height;
    }
  };
</script>

<!-- Window listeners -->
<svelte:window on:resize={getBubbleSize} />

<!-- Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Content -->
<div id="speech-bubble" transition:fly={{ y: 80, duration: 200 }} bind:this={bubble}>
  <div id="big-gradient" class="moving-gradient">
    <div class="bg" />
  </div>
  <div id="little-gradient" class="moving-gradient">
    <div class="rotation-corrector">
      <div class="position-corrector" style:left="calc({bubbleWidth/2}px - 3rem)" style:bottom="{bubbleHeight/2}px">
        <div class="bg" />
      </div>
    </div>
  </div>
  <div class="text">
    <span>{written}</span>
  </div>
</div>

<!-- Clickable Overlay -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="click-mask" on:click={close} />

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

  .moving-gradient {
    position: absolute;
    background-color: var(--c3);
    overflow: hidden;
  }

  .moving-gradient .bg {
    --size: calc(1.2 * var(--game-size));
    content: "";
    position: absolute;
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
  
  #big-gradient.moving-gradient {
    inset: -3px;
    border-radius: 1rem;
  }

  #big-gradient.moving-gradient .bg {
    left: calc(50% - 0.5 * var(--size));
    top: calc(50% - 0.5 * var(--size));
  }

  #little-gradient.moving-gradient {
    left: calc(2rem - 1px);
    width: 26px;
    height: 27px;
    bottom: -15px;
    border-radius: 0 0 5px 0;
    transform: rotate(45deg);
  }
  
  #little-gradient > .rotation-corrector {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: rotate(-45deg);
  }

  #little-gradient .position-corrector {
    position: relative;
    left: 150px;
    top: -30px;
  }

  #little-gradient .bg {
    left: calc(-0.5 * var(--size));
    top: calc(-0.5 * var(--size));
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

  #click-mask {
    position: absolute;
    inset: 0;
    z-index: 1;
    cursor: pointer;
  }
</style>