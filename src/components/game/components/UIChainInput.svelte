<script type="ts">
  import type { UIChainInput } from "./Menu.svelte";

  export let input: UIChainInput;
  export let index: number;

  // Constants:
  const chains = [
    { id: 1, name: "Ethereum" },
    { id: 10, name: "Optimism" },
    { id: 137, name: "Polygon" },
    { id: 43114, name: "Avalanche" }
  ];

  // Variables:
  let chain = input.chain ?? 10;

  // Reactive Statements:
  $: input.onChange(chain ?? 10);
  $: if(input.next != next) input.next = next;
  $: filteredChains = chains.filter(x => (input.chainIds ?? [1,10,137,43114]).includes(x.id));

  // Next function:
  const next = () => {
    let index = -1;
    filteredChains.forEach((x, i) => {
      if(x.id == chain) index = i;
    });
    if(index >= filteredChains.length - 1) index = -1;
    chain = filteredChains[index + 1].id;
  };
</script>

<!-- Select -->
<div id="wrapper">
  <select
    bind:value={chain}
    title={input.title ?? ""}
    class="game-ui"
    style={input.style ?? ""}
    data-index={index}
    class:disabled={input.disabled}
    disabled={input.disabled}
  >
    {#each filteredChains as chain}
      <option value={chain.id}>{chain.name}</option>
    {/each}
  </select>
  <i id="caret" class="icofont-caret-down"/>
</div>

<!-- Style -->
<style>
  #wrapper {
    position: relative;
  }

  #caret {
    position: absolute;
    top: 50%;
    right: 0.5rem;
    font-size: 16px;
    transform: translateY(-50%);
    pointer-events: none;
  }

  select {
    width: 100%;
    color: inherit;
    font-family: inherit;
    appearance: initial;
  }

  option {
    color: initial;
  }
</style>