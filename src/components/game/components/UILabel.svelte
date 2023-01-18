<script type="ts">
  import type { UILabel } from "./Menu.svelte";
  export let label: UILabel;
</script>

{#if !label.disabled}
  <strong id="label" class="game-ui" title={label.title ?? ""} style={label.style ?? ""}>
    {@html label.label}
  </strong>
{/if}

<!-- Style -->
<style>
  #label {
    position: relative;
    background: linear-gradient(165deg, #bbba -50%, var(--c0) 110%);
    outline: none;
  }
</style>