<script type="ts">
  import ButtonControllerSvelte from "./ButtonController.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import { DeviceButtons, EMPTY_BUTTON } from "./Buttons.svelte";
  import type { UIButton, UIComponent } from "./Menu.svelte";
  import Menu from "./Menu.svelte";
  import ChooseEnvironment from "./ChooseEnvironment.svelte";

  // Props:
  export let deviceButtonController: ButtonController;
  export let close: () => void;

  // Variables:
  let page: 'environment' | 'species' | null = null;

  // Menu Components:
  let menuComponents: (UIComponent | null)[];
  $: menuComponents = [
    { type: "button", name: "<i class='icofont-picture' style='color:hsl(190,75%,64%);'></i> environment", action: () => page = 'environment' } as UIButton,
    { type: "button", name: "<i class='icofont-dna-alt-1' style='color:hsl(310,75%,64%);'></i> species", action: () => page = 'species' } as UIButton,
    { type: "button", name: "<i class='icofont-undo colored'></i> back", action: close } as UIButton,
  ];

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

<!-- Page -->
{#if page === 'environment'}
  <ChooseEnvironment {deviceButtonController} close={() => page = null} />
{:else if page === 'species'}
  <!--  -->
{:else}
  <Menu components={menuComponents} />
{/if}