<script type="ts">
  import type { UIButton } from "./game";
  import { selectMenuComponent } from "./Game.svelte";
  export let button: UIButton;
  export let selected = false;

  let buttonElement: HTMLButtonElement | undefined;
  $: if(selected && buttonElement) buttonElement.focus(); 

  const onHover = () => {
    buttonElement?.focus();
    selectMenuComponent(button);
  };
</script>

<!-- Button -->
<button
  bind:this={buttonElement}
  on:click={button.action}
  on:pointerenter={onHover}
>
  {button.name}
</button>

<!-- Style -->
<style>
  button:focus {
    background: var(--bg-gradient);
    outline: 1px solid var(--c3);
    animation-name: outline-pulse;
    animation-duration: 1.2s;
    animation-play-state: running;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }
</style>