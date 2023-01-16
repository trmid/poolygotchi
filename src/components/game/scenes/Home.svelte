<!-- Component -->
<script type="ts">
  import type { UIButton, UIComponent } from "../components/Menu.svelte";
  import Deposit from "../components/Deposit.svelte";
  import type Poolygotchi from "../../../utils/poolygotchi";
  import PoolygotchiSvelte from "../components/Poolygotchi.svelte";
  import Scene from "../components/Scene.svelte";
  import Menu from "../components/Menu.svelte";
  import { buttonController } from "../components/ButtonController.svelte";
  import Environment from "../components/Environment.svelte";
  import Withdraw from "../components/Withdraw.svelte";

  // Parameters:
  export let poolygotchi: Poolygotchi;

  // Types:
  type Widget = 'deposit' | 'withdraw' | 'personalize' | 'goal';  

  // Variables:
  let poolygotchiComponent: PoolygotchiSvelte | undefined;
  let showMenu = false;
  let widget: Widget | null = null;
  let menuComponents: UIComponent[] = [
    { type: "button", name: "<i class='icofont-coins' style='color:hsl(50,75%,64%);'></i>deposit", action: () => { widget = "deposit" } } as UIButton,
    { type: "button", name: "<i class='icofont-star' style='color:hsl(310,75%,64%);'></i>goal", action: () => { console.log("goal") } } as UIButton,
    { type: "button", name: "<i class='icofont-paint' style='color:hsl(30,75%,64%);'></i>personalize", action: () => { console.log("personalize") } } as UIButton,
    { type: "button", name: "<i class='icofont-undo' style='color:hsl(0,75%,64%);'></i>close", action: () => showMenu = false } as UIButton,
    { type: "button", name: "<i class='icofont-exit' style='color:hsl(10,75%,64%);'></i>withdraw", action: () => { widget = "withdraw" } } as UIButton,
    { type: "button", name: "<i class='icofont-game' style='color:hsl(80,75%,64%);'></i>minigames", action: () => { console.log("minigames") }, disabled: true, title: "Coming Soon!" } as UIButton,
    { type: "button", name: "<i class='icofont-ui-home' style='color:hsl(190,75%,64%);'></i>visit", action: () => { console.log("visit") }, disabled: true, title:"Coming Soon!" } as UIButton,
  ];
  const deviceButtonController = buttonController({
    left: { title: "Home", class: "icofont-ui-home", action: () => showMenu = false },
    middle: { title: "Interact!", class: "icofont-comment", action: () => { showMenu = false; poolygotchiComponent?.interact(); } },
    right: { title: "Menu", class: "icofont-navigation-menu", action: () => showMenu = !showMenu },
  });
</script>

<Scene {deviceButtonController}>

  <!-- Poolygotchi -->
  {#await poolygotchi.data() then data}
        
    <!-- Environment -->
    <Environment environmentId={data.environmentId} />

    <!-- Poolygotchi -->
    <PoolygotchiSvelte {poolygotchi} {deviceButtonController} bind:this={poolygotchiComponent} />

  {/await}

  <!-- Menu or Widget -->
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

  {/if}

</Scene>