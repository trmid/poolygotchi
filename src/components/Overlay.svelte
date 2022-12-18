<!-- svelte-ignore a11y-click-events-have-key-events -->

<script type="ts">
  export let width = 720;
  export let zIndex = 100;
  export let close: () => void;
</script>

<div id="overlay-bg" style:z-index={zIndex} on:click={close}>
  <div id="overlay" style:width="{width}px" on:click|stopPropagation>
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
  }
  #overlay {
    box-sizing: content-box;
    max-width: calc(100vw - 1rem);
    max-height: calc(100vh - 1rem);
    padding: 1rem;
    border-radius: 1rem;
    background-color: var(--c0);
    box-shadow: 2px 2px 7px #0006;
  }
</style>