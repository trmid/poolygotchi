<!-- Component -->
<script type="ts">
  import Screen from "./Screen.svelte";
  import Buttons from "./Buttons.svelte";
  import type { ButtonController } from "./ButtonController.svelte";

  // Props:
  export let deviceButtonController: ButtonController;

</script>

<!-- Screen -->
<Screen>
  <slot></slot>
</Screen>

<!-- Buttons -->
<Buttons buttons={$deviceButtonController} />