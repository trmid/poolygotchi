<!-- Module -->
<script type="ts" context="module">
  import type { UIComponent, DeviceButtons } from "./game";
  import { get, writable } from "svelte/store";
  import type Poolygotchi from "../../utils/poolygotchi";
  import { account } from "../Account.svelte";
  import { stateStack } from "../../utils/stateStack";

  /* Default Values */
  const DEFAULT_BUTTONS = {
    left: { title: "No Action", class: "icofont-minus", action: () => null },
    middle: { title: "No Action", class: "icofont-minus", action: () => null },
    right: { title: "No Action", class: "icofont-minus", action: () => null }
  };

  /* Game State Stores */
  export const poolygotchi = writable<Poolygotchi | null>(null);
  export const viewingAsGuest = writable(false);
  export const showMenu = writable(false);
  export const gameUI = stateStack<{
    menu: {
      components: UIComponent[],
      index: number
    },
    buttons: DeviceButtons
  }>({
    menu: {
      components: [],
      index: 0
    },
    buttons: DEFAULT_BUTTONS
  });

  /* Helper Functions */
  export function selectMenuComponent(component: UIComponent) {
    const ui = get(gameUI);
    const index = ui.menu.components.indexOf(component);
    if(index > -1) {
      ui.menu.index = index;
      gameUI.replace(ui);
    } else {
      throw new Error("Selecting non-existent component");
    }
  }

  /* Set Default Game UI */
  export function rebaseUI() {
    gameUI.rebase({
      menu: {
        components: [],
        index: 0
      },
      buttons: DEFAULT_BUTTONS
    });
  }

  /* Subscriptions */
  account.subscribe(account => {
    if(account) {
      account.poolygotchi()
        .then(poolygotchi.set)
        .catch(console.error);
    } else {
      poolygotchi.set(null);
    }
  });
  poolygotchi.subscribe(console.log);
</script>

<!-- Component -->
<script type="ts">
  import Screen from "./Screen.svelte";
  import Buttons from "./Buttons.svelte";
</script>

<!-- Device Container -->
<div id="device">
  <div class="case" />
  <Screen />
  <Buttons buttons={$gameUI.buttons} />
</div>

<!-- Style -->
<style>
  #device {
    --game-size: 300px;
    width: var(--game-size);
    position: relative;
    margin: 1rem 0;
  }

  #device > .case {
    position: absolute;
    z-index: -1;
    background-color: var(--c0);
    background: linear-gradient(0deg, #0000 5%, #fff2 40%, #fff2 60%, #0000 95%);
    border-radius: 50%;
    top: -30%;
    bottom: -15%;
    left: -35%;
    right: -35%;
  }

  @media screen and (min-width: 1024px) {
    #device {
      --game-size: 450px;
    }
  }
</style>