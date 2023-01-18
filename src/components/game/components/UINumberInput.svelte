<script type="ts">
  import type { UINumberInput } from "./Menu.svelte";

  export let input: UINumberInput;
  export let select: () => void;
  export let index: number;

  let value = 0;

  $: if(input.initialValue !== undefined) setInitial();
  $: input.onChange(value ?? 0);

  function setInitial() {
    value = input.initialValue ?? 0;
  }
</script>

<!-- Input -->
<div class='wrapper'>
  <input
    bind:value={value}
    on:pointerenter={select}
    title={input.title ?? ""}
    data-index={index}
    class="game-ui"
    type="number"
    {...(input.attributes ?? {})}
    placeholder={input.placeholder ?? ""}
    disabled={input.disabled}
    style={input.style ?? ""}
  />
  {#if input.token}
    <img class="token" src="img/{input.token}.webp" alt={input.token.toUpperCase()}>
  {/if}
</div>

<!-- Style -->
<style>
  input {
    width: 100%;
    box-sizing: border-box;
  }
  .wrapper {
    position: relative;
  }
  .wrapper > img.token {
    position: absolute;
    width: 24px;
    height: 24px;
    left: 5px;
    top: 50%;
    transform: translateY(-50%);
  }
</style>