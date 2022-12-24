<!-- Module -->
<script type="ts" context="module">
  import type { UIComponent, DeviceButtons, UIButton } from "./game";
  import { get, writable } from "svelte/store";
  import type Poolygotchi from "../../utils/poolygotchi";
  import { account } from "../Account.svelte";
  import { connect } from "../ConnectOverlay.svelte";
  import { push } from "svelte-spa-router";

  /* Game State Stores */
  export const poolygotchi = writable<Poolygotchi | null>(null);
  export const viewingAsGuest = writable(false);
  export const menuComponents = writable<UIComponent[]>([]);
  export const menuSelectedIndex = writable(0);
  export const showMenu = writable(false);
  export const buttons = writable<DeviceButtons>({
    left: { title: "-", class: "icofont-minus", action: () => null },
    middle: { title: "connect", class: "icofont-wallet", action: () => connect().catch(console.error) },
    right: { title: "about", class: "icofont-question", action: () => push("/about") }
  });

  /* Helper Functions */
  export function selectMenuComponent(component: UIComponent) {
    const index = get(menuComponents).indexOf(component);
    if(index > -1) {
      menuSelectedIndex.set(index);
    } else {
      throw new Error("Selecting non-existent component");
    }
  }

  /* Subscriptions */
  account.subscribe(account => {
    if(account) {
      account.poolygotchi()
        .then(gotchi => {
          poolygotchi.set(gotchi);
          if(gotchi) {
            buttons.set({
              left: { title: "Home", class: "icofont-ui-home", action: () => {console.log("home")} },
              middle: { title: "Interact!", class: "icofont-comment", action: () => {console.log("interact")} },
              right: { title: "Menu", class: "icofont-navigation-menu", action: () => showMenu.set(!get(showMenu)) },
            });
            menuSelectedIndex.set(0);
            menuComponents.set([
              { type: "button", name: "btn1", action: () => { console.log("btn1") } } as UIButton,
              { type: "button", name: "btn2", action: () => { console.log("btn2") } } as UIButton,
              { type: "button", name: "close", action: () => showMenu.set(false) } as UIButton
            ]);
          }
        })
        .catch(console.error);
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
  <Buttons buttons={$buttons} />
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

  @media screen and (max-width: 320px) {
    #device {
      --game-size: 200px;
    }
  }

  @media screen and (min-width: 1024px) {
    #device {
      --game-size: 450px;
    }
  }
</style>