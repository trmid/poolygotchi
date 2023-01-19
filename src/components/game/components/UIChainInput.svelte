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
<select
  bind:value={chain}
  title={input.title ?? ""}
  data-index={index}
  class="game-ui"
  class:disabled={input.disabled}
  disabled={input.disabled}
  style={input.style ?? ""}
>
  {#each filteredChains as chain}
    <option value={chain.id}>{chain.name}</option>
  {/each}
</select>

<!-- Style -->
<style>
  select {
    color: inherit;
    font-family: inherit;
    height: 100%;
    border: none;
  }

  option {
    color: initial;
  }
</style>