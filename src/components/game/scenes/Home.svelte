<!-- Component -->
<script type="ts">
  import { uiButton, UIButton, UIComponent } from "../components/Menu.svelte";
  import Deposit from "../components/Deposit.svelte";
  import type Poolygotchi from "../../../utils/poolygotchi";
  import PoolygotchiSvelte from "../components/Poolygotchi.svelte";
  import Menu from "../components/Menu.svelte";
  import Environment from "../components/Environment.svelte";
  import Withdraw from "../components/Withdraw.svelte";
  import Personalize from "../components/Personalize.svelte";
  import ButtonControllerSvelte, { buttonController } from "../components/ButtonController.svelte";
  import type { ButtonController } from "../components/ButtonController.svelte";
  import { DeviceButtons, EMPTY_BUTTON } from "../components/Buttons.svelte";
  import Goal from "../components/Goal.svelte";
  import PrizeClaim from "../components/PrizeClaim.svelte";

  // Parameters:
  export let poolygotchi: Poolygotchi;
  export let deviceButtonController: ButtonController;

  // Types:
  type Widget = 'deposit' | 'withdraw' | 'personalize' | 'goal' | 'prizes'; 

  // Variables:
  let poolygotchiComponent: PoolygotchiSvelte | undefined;
  let showMenu = false;
  let widget: Widget | null = null;
  let menuComponents: UIComponent[] = [
    uiButton({ icon: "icofont-coins colored", name: "deposit", title: "Deposit", action: () => { widget = "deposit" } }),
    uiButton({ icon: "icofont-star colored", name: "goal", title: "Goal", action: () => { widget = "goal" } }),
    uiButton({ icon: "icofont-paint colored", name: "personalize", title: "Personalize", action: () => { widget = "personalize" } }),
    uiButton({ icon: "icofont-undo colored", name: "close", title: "Close", action: () => showMenu = false }),
    uiButton({ icon: "icofont-exit colored", name: "withdraw", title: "Withdraw", action: () => { widget = "withdraw" } }),
    uiButton({ icon: "icofont-money colored", name: "prizes", title: "Prizes", action: () => { widget = "prizes" } }),
    uiButton({ icon: "icofont-game colored", name: "minigames", title: "Coming Soon!", action: () => { console.log("minigames") }, disabled: true }),
    uiButton({ icon: "icofont-ui-home colored", name: "visit", title: "Coming Soon!", action: () => { console.log("visit") }, disabled: true }),
  ];
  const buttons: DeviceButtons = {
    left: { title: "Home", class: "icofont-ui-home", action: () => { showMenu = false; widget = null; } },
    middle: { title: "Interact!", class: "icofont-comment", action: () => { console.log(poolygotchiComponent); poolygotchiComponent?.interact();} },
    right: { title: "Menu", class: "icofont-navigation-menu", action: () => showMenu = true },
  };
</script>

<!-- Device Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Poolygotchi -->
{#await poolygotchi.data() then data}
      
  <!-- Environment -->
  <Environment environmentId={data.environmentId} />

  <!-- Poolygotchi (give dummy button controller if menu or widget is open) -->
  <PoolygotchiSvelte
    bind:this={poolygotchiComponent}
    {poolygotchi}
    deviceButtonController={
      (showMenu || widget) ?
      buttonController({ left: EMPTY_BUTTON, middle: EMPTY_BUTTON, right: EMPTY_BUTTON }) :
      deviceButtonController
    }
  />

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
  <Goal {deviceButtonController} close={() => widget = null} />

{:else if widget === "prizes"}

  <!-- Prizes -->
  <PrizeClaim {deviceButtonController} close={() => widget = null} />

{/if}