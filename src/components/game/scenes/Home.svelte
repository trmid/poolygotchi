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
  import { DeviceButtons, EMPTY_BUTTON } from "../components/Buttons.svelte";

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
    { type: "button", icon: "icofont-coins colored", name: "deposit", title: "Deposit", action: () => { widget = "deposit" } } as UIButton,
    { type: "button", icon: "icofont-star colored", name: "goal", title: "Goal", action: () => { widget = "goal" } } as UIButton,
    { type: "button", icon: "icofont-paint colored", name: "personalize", title: "Personalize", action: () => { widget = "personalize" } } as UIButton,
    { type: "button", icon: "icofont-undo colored", name: "close", title: "Close", action: () => showMenu = false } as UIButton,
    { type: "button", icon: "icofont-exit colored", name: "withdraw", title: "Withdraw", action: () => { widget = "withdraw" } } as UIButton,
    { type: "button", icon: "icofont-game colored", name: "minigames", title: "Coming Soon!", action: () => { console.log("minigames") }, disabled: true } as UIButton,
    { type: "button", icon: "icofont-ui-home colored", name: "visit", title: "Coming Soon!", action: () => { console.log("visit") }, disabled: true } as UIButton,
  ];
  const buttons: DeviceButtons = {
    left: EMPTY_BUTTON,
    middle: { title: "Interact!", class: "icofont-comment", action: () => poolygotchiComponent?.interact() },
    right: { title: "Menu", class: "icofont-navigation-menu", action: () => showMenu = true },
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
  <Menu components={menuComponents} {deviceButtonController} />

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