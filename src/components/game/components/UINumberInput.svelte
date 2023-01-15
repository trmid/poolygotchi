<script type="ts">
  import type { UINumberInput } from "./Menu.svelte";

  export let input: UINumberInput;
  export let selected = false;
  export let onSelect: () => void;

  let inputElement: HTMLInputElement | undefined;
  let value = input.initialValue ?? 0;

  $: if(selected && inputElement) inputElement.focus(); 
  $: input.onChange(value);

  const onHover = () => {
    inputElement?.focus();
    onSelect();
  };
</script>

<!-- Button -->
<input
  bind:this={inputElement}
  bind:value={value}
  on:pointerenter={onHover}
  type="number"
  {...{min:0,max:0,step:1}}
  placeholder={input.placeholder ?? ""}
  disabled={input.disabled}
/>

<!-- Style -->
<style>
  input {
    font-size: 14px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
  }
  input:focus, input:hover {
    background: var(--bg-gradient);
    outline: 1px solid var(--c3);
    animation-name: outline-pulse;
    animation-duration: 1.2s;
    animation-play-state: running;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
  input:disabled {
    filter: grayscale(0.8);
  }
</style>