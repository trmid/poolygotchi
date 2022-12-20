<script type="ts">
  import type { UIButton } from "./game";
  export let button: UIButton;
</script>

<button on:click={button.action}>{button.name}</button>