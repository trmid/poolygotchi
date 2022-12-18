<script type="ts">
  export let name: string;
  export let onClick: () => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="container" on:click={onClick}>
  <span id="logo">
    <slot name="logo"></slot>
  </span>
  <button on:click|stopPropagation={onClick}>
    {name}
  </button>
</div>

<!-- Style -->
<style>
  #container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem;
  }
  #logo, #logo>:global(*) {
    width: 2rem;
    display: inline-flex;
  }
  button {
    flex-grow: 1;
  }
</style>