<script type="ts">
  import type { UILabel } from "./Menu.svelte";
  export let label: UILabel;
</script>

<strong id="label" class="game-ui" title={label.title ?? ""} style={label.style ?? ""}>
  {@html label.label}
  {#if label.token}
    <img class="token" src="img/{label.token}.webp" alt={label.token.toUpperCase()}>
  {/if}
</strong>

<!-- Style -->
<style>
  #label {
    position: relative;
    background: linear-gradient(165deg, #bbba -50%, var(--c0) 110%);
    outline: none;
  }
  #label > img.token {
    position: absolute;
    width: 24px;
    height: 24px;
    left: 5px;
    top: 50%;
    transform: translateY(-50%);
  }
</style>