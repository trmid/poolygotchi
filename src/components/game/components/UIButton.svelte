<script type="ts">
  import type { UIButton } from "./Menu.svelte";

  export let button: UIButton;
  export let select: () => void;
  export let index: number;

</script>

<!-- Button -->
<button
  on:click={button.disabled ? null : button.action}
  on:pointerenter={select}
  data-index={index}
  title={button.title ?? ""}
  class="game-ui"
  class:disabled={button.disabled}
  style={button.style ?? ""}
>
  {#if button.icon}
    <i class="icon {button.icon}" />
  {/if}
  {@html button.name}
</button>

<!-- Style -->
<style>
  button {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
  }
  button > i.icon {
    font-size: 16px;
  }
</style>