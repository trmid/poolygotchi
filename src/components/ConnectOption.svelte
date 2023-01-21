<script type="ts">
  export let name: string;
  export let disabled = false;
  export let onClick: () => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="container" on:click={() => !disabled && onClick()} class:disabled title={disabled ? "Not Found" : "Connect"}>
  <span id="logo">
    <slot name="logo"></slot>
  </span>
  <button class="pulse" on:click|stopPropagation={() => !disabled && onClick()}>
    {name}
  </button>
</div>

<!-- Style -->
<style>
  #container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
  }
  #container.disabled {
    filter: grayscale(0.8);
  }
  #logo, #logo>:global(*) {
    width: 2rem;
    display: inline-flex;
  }
  button {
    flex-grow: 1;
  }
</style>