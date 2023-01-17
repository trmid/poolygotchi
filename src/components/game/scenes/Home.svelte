<!-- Component -->
<script type="ts">
  import type { UIButton, UIComponent } from "../components/Menu.svelte";
  import Deposit from "../components/Deposit.svelte";
  import type Poolygotchi from "../../../utils/poolygotchi";
  import PoolygotchiSvelte from "../components/Poolygotchi.svelte";
  import Menu from "../components/Menu.svelte";
  import Environment from "../components/Environment.svelte";
  import Withdraw from "../components/Withdraw.svelte";
  import Personalize from "../components/Personalize.svelte";
  import ButtonControllerSvelte from "../components/ButtonController.svelte";
  import type { ButtonController } from "../components/ButtonController.svelte";
  import type { DeviceButtons } from "../components/Buttons.svelte";

  // Parameters:
  export let poolygotchi: Poolygotchi;
  export let deviceButtonController: ButtonController;

  // Types:
  type Widget = 'deposit' | 'withdraw' | 'personalize' | 'goal';  

  // Variables:
  let poolygotchiComponent: PoolygotchiSvelte | undefined;
  let showMenu = false;
  let widget: Widget | null = null;
  let menuComponents: UIComponent[] = [
    { type: "button", name: "<i class='icofont-coins' style='color:var(--icon-gold);'></i>deposit", action: () => { widget = "deposit" } } as UIButton,
    { type: "button", name: "<i class='icofont-star' style='color:var(--icon-pink);'></i>goal", action: () => { widget = "goal" } } as UIButton,
    { type: "button", name: "<i class='icofont-paint' style='color:var(--icon-orange);'></i>personalize", action: () => { widget = "personalize" } } as UIButton,
    { type: "button", name: "<i class='icofont-undo colored'></i>close", action: () => showMenu = false } as UIButton,
    { type: "button", name: "<i class='icofont-exit' style='color:var(--icon-red-orange);'></i>withdraw", action: () => { widget = "withdraw" } } as UIButton,
    { type: "button", name: "<i class='icofont-game' style='color:var(--icon-green);'></i>minigames", action: () => { console.log("minigames") }, disabled: true, title: "Coming Soon!" } as UIButton,
    { type: "button", name: "<i class='icofont-ui-home' style='color:var(--icon-blue);'></i>visit", action: () => { console.log("visit") }, disabled: true, title:"Coming Soon!" } as UIButton,
  ];
  const buttons: DeviceButtons = {
    left: { title: "Home", class: "icofont-ui-home", action: () => { showMenu = false; widget = null; } },
    middle: { title: "Interact!", class: "icofont-comment", action: () => { showMenu = false; poolygotchiComponent?.interact(); } },
    right: { title: "Menu", class: "icofont-navigation-menu", action: () => showMenu = !showMenu },
  };
</script>

<!-- Device Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Poolygotchi -->
{#await poolygotchi.data() then data}
      
  <!-- Environment -->
  <Environment environmentId={data.environmentId} />

  <!-- Poolygotchi -->
  <PoolygotchiSvelte {poolygotchi} {deviceButtonController} bind:this={poolygotchiComponent} />

{/await}

<!-- Menu or Widget -->
{#if showMenu && !widget}

  <!-- Menu -->
  <Menu components={menuComponents} />

{:else if widget === "deposit"}

  <!-- Deposit -->
  <Deposit {deviceButtonController} close={() => widget = null} />

{:else if widget === "withdraw"}

  <!-- Withdraw -->
  <Withdraw {deviceButtonController} close={() => widget = null} />

{:else if widget === "personalize"}

  <!-- Personalize -->
  <Personalize {deviceButtonController} close={() => widget = null} />

{:else if widget === "goal"}

  <!-- Goal -->
  <!-- <Goal {deviceButtonController} close={() => widget = null} /> -->

{/if}