<script type="ts">
  import type { UILabel } from "./Menu.svelte";
  export let label: UILabel;
</script>

<span id="label" class="game-label" title={label.title ?? ""} style={label.style ?? ""} class:disabled={label.disabled}>
    {@html label.label}
</span>

<!-- Style -->
<style>
  #label {
    position: relative;
    background: linear-gradient(165deg, #bbba -50%, var(--c0) 110%);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
  }
</style>