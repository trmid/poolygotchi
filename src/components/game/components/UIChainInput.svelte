<script type="ts">
  import type { UIChainInput } from "./Menu.svelte";

  export let input: UIChainInput;
  export let select: () => void;
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

  // Next function:
  const next = () => {
    let index = -1;
    chains.forEach((x, i) => {
      if(x.id == chain) index = i;
    });
    if(index >= chains.length - 1) index = -1;
    chain = chains[index + 1].id;
  };
</script>

<!-- Select -->
<select
  bind:value={chain}
  on:pointerenter={select}
  title={input.title ?? ""}
  data-index={index}
  class="game-ui"
  class:disabled={input.disabled}
  disabled={input.disabled}
  style={input.style ?? ""}
>
  <option value={1}>Ethereum</option>
  <option value={10}>Optimism</option>
  <option value={137}>Polygon</option>
  <option value={43114}>Avalanche</option>
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