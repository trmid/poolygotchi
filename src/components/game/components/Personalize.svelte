<script type="ts">
  import type { ButtonController } from "./ButtonController.svelte";
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
    { type: "button", icon: "icofont-picture colored", name: "environment", title: "Environment", action: () => page = 'environment' } as UIButton,
    { type: "button", icon: "icofont-dna-alt-1 colored", name: "species", title: "Species", action: () => page = 'species' } as UIButton,
    { type: "button", icon: "icofont-undo colored", name: "back", title: "Back", action: close } as UIButton,
  ];

</script>

<!-- Page -->
{#if page === 'environment'}
  <ChooseEnvironment {deviceButtonController} close={() => page = null} />
{:else if page === 'species'}
  <!--  -->
{:else}
  <Menu components={menuComponents} {deviceButtonController}  />
{/if}