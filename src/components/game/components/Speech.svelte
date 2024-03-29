<script type="ts">
  import { fly } from "svelte/transition";
  import ButtonControllerSvelte from "./ButtonController.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import { DeviceButtons, EMPTY_BUTTON } from "./Buttons.svelte";

  // Exports:
  export let speech: string;
  export let deviceButtonController: ButtonController | undefined = undefined;
  export let close: (() => void) | undefined = undefined;

  // Buttons:
  let buttons: DeviceButtons
  $: action = actionStage === "continue" ? finishWriting : close;
  $: buttons = {
    left: EMPTY_BUTTON,
    middle: actionStage === "continue" ?
      { title: "Continue", class: "icofont-ui-play", action: action ?? (() => null) } :
      { title: "Acknowledge", class: "icofont-ui-check", action: action ?? (() => null) },
    right: EMPTY_BUTTON,
  };

  // Variables:
  let written = "";
  let actionStage: "continue" | "acknowledge" = "continue";
  let timer: NodeJS.Timer | null = null;
  let bubble: HTMLDivElement | undefined;
  let bubbleWidth = 300;
  let bubbleHeight = 60;

  // Reactions:
  $: speech, reset();
  $: written, getBubbleSize();

  // Functions:
  const finishWriting = () => {
    (timer !== null) && clearInterval(timer);
    written = speech;
    actionStage = "acknowledge";
  };

  const reset = () => {
    written = "";
    actionStage = "continue";
    if(timer) clearInterval(timer);
    timer = setInterval(() => {
      if(written.length == speech.length) {
        finishWriting();
      } else {
        written += speech[written.length];
      }
    }, 40);
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

{#if deviceButtonController}
  <!-- Button Controller -->
  <ButtonControllerSvelte controller={deviceButtonController} {buttons} />
{/if}

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

{#if action}
  <!-- Clickable Overlay -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div id="click-mask" on:click={action} />
{/if}

<!-- Style -->
<style>
  #speech-bubble {
    position: absolute;
    top: 6%;
    left: 6%;
    right: 6%;
  }

  #speech-bubble > .text {
    position: relative;
    inset: 0;
    background-color: var(--c3);
    color: #222;
    padding: calc(0.04 * var(--game-size));
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
    isolation: isolate;
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
    cursor: pointer;
  }
</style>