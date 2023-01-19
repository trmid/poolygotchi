<script type="ts">
  import type { UILabel } from "./Menu.svelte";
  export let label: UILabel;
</script>

<strong id="label" class="game-ui" title={label.title ?? ""} style={label.style ?? ""} class:disabled={label.disabled}>
    {@html label.label}
</strong>

<!-- Style -->
<style>
  #label {
    position: relative;
    background: linear-gradient(165deg, #bbba -50%, var(--c0) 110%);
    outline: none;
  }
</style>