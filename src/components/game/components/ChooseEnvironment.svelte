<script type="ts">
  import ButtonControllerSvelte from "./ButtonController.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import { DeviceButtons, EMPTY_BUTTON } from "./Buttons.svelte";

  // Props:
  export let deviceButtonController: ButtonController;
  export let close: () => void;

  // Device Buttons:
  let buttons: DeviceButtons;
  $: buttons = {
    left: { title: "back", class: "icofont-undo", action: close },
    middle: EMPTY_BUTTON,
    right: EMPTY_BUTTON
  };

</script>

<!-- Device Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Environment Selector -->
