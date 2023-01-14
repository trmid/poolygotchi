<!-- svelte-ignore a11y-click-events-have-key-events -->

<script type="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  export let width = 720;
  export let zIndex = 100;
  export let close: () => void;
  
  let offsetRight = 0;

  onMount(() => {
    if(document.body.clientWidth < window.innerWidth) {
      offsetRight = (window.innerWidth - document.body.clientWidth)/2;
    }
  });
</script>

<div id="overlay-bg" style:z-index={zIndex} on:click={close}>
  <div
    id="overlay"
    style:width="{width}px"
    style:right="{offsetRight}px"
    on:click|stopPropagation
    transition:fly={{ duration: 200, y: 100 }}
  >
    <slot></slot>
  </div>
</div>

<style>
  #overlay-bg {
    isolation: isolate;
    position: fixed;
    inset: 0;
    background-color: #0004;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  #overlay {
    position: relative;
    box-sizing: content-box;
    max-width: calc(100vw - 4rem);
    max-height: calc(100vh - 4rem);
    padding: 1rem;
    border-radius: 1rem;
    background-color: var(--c0);
    box-shadow: 2px 2px 7px #0006;
  }
</style>