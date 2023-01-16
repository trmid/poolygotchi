<script type="ts">
  import type { UIChainInput } from "./Menu.svelte";

  export let input: UIChainInput;
  export let select: () => void;
  export let index: number;

  let chain = input.chain ?? 10;

  $: input.onChange(chain ?? 10);
</script>

<!-- Select -->
<select
  bind:value={chain}
  on:pointerenter={select}
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