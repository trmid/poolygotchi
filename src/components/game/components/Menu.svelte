<!-- Module -->
<script type="ts" context="module">
  type Token = 'usdc';

  export interface UIComponent {
    type: 'button' | 'number' | 'label' | 'chain'
    title?: string
    icon?: string
    style?: string
    disabled?: boolean
  }

  export interface UIButton extends UIComponent {
    type: 'button'
    name: string
    action: () => any
  }

  export interface UINumberInput extends UIComponent {
    type: 'number'
    placeholder?: string
    initialValue?: number
    attributes?: Object
    token?: Token
    onChange: (value: number) => void
  }

  export interface UILabel extends UIComponent {
    type: 'label'
    label: string
    token?: Token
  }

  export interface UIChainInput extends UIComponent {
    type: 'chain'
    chain: number
    onChange: (chain: number) => void
    next?: () => void
  }

  export const uiNumberInput = (c: UINumberInput) => c;
  export const uiLabel = (c: UILabel) => c;
  export const uiButton = (c: UIButton) => c;
  export const uiChainInput = (c: UIChainInput) => c;

  export const asButton = (component: UIComponent): UIButton => {
    if(component.type === "button") return component as UIButton;
    throw new Error("expected button");
  };

  export const asNumberInput = (component: UIComponent): UINumberInput => {
    if(component.type === "number") return component as UINumberInput;
    throw new Error("expected number");
  };

  export const asLabel = (component: UIComponent): UILabel => {
    if(component.type === "label") return component as UILabel;
    throw new Error("expected label");
  };

  export const asChainInput = (component: UIComponent): UIChainInput => {
    if(component.type === "chain") return component as UIChainInput;
    throw new Error("expected chain");
  };

  export const componentIcon = (component: UIComponent): string | null => {
    if(component.icon) return component.icon;
    switch(component.type) {
      case "button": return "icofont-ui-check";
      case "chain": return "icofont-edit";
      case "number": return "icofont-edit";
      default: return null;
    }
  };
</script>

<!-- Component -->
<script type="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import UIButtonSvelte from "./UIButton.svelte";
  import UINumberInputSvelte from "./UINumberInput.svelte";
  import UILabelSvelte from "./UILabel.svelte";
  import UIChainInputSvelte from "./UIChainInput.svelte";
  import ButtonControllerSvelte from "./ButtonController.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import { DeviceButtons, EMPTY_BUTTON } from "./Buttons.svelte";

  // Props:
  export let title = "menu";
  export let components: (UIComponent | null)[];
  export let selectedComponentIndex = 0;
  export let itemsPerColumn = 4;
  export let deviceButtonController: ButtonController;

  // Variables:
  let selectedComponent: UIComponent | null = null;
  let menu: HTMLElement;

  // Reactive statements:
  $: selectedComponentIndex, enforceComponentSelection();

  // Device Buttons:
  let buttons: Partial<DeviceButtons>;
  $: buttons = {
    // left: components.length > 0 ? { title: "Previous", class: "icofont-caret-up", action: () => selectPreviousComponent() } : EMPTY_BUTTON,
    middle: (selectedComponent && !selectedComponent.disabled) ?
      {
        title: (selectedComponent as any).title ?? "Select",
        class: componentIcon(selectedComponent) ?? "icofont-ui-check",
        action: () => {
          const elem = focusIndex(selectedComponentIndex);
          if(selectedComponent?.type === "chain") (asChainInput(selectedComponent).next ?? (() => null))();
          else elem?.click();
        }
      } :
      EMPTY_BUTTON,
    right: components.length > 0 ? { title: "Next", class: "icofont-caret-down", action: () => selectNextComponent() } : EMPTY_BUTTON
  };

  // Functions:
  const hasSelectable = (components: (UIComponent | null)[]) => {
    return components.filter(x => x !== null && x.type !== 'label').length > 0;
  };

  const enforceComponentSelection = () => {
    if(hasSelectable(components)) {
      selectedComponent = components[selectedComponentIndex];
      while(!selectedComponent || selectedComponent.type === 'label') {
        if(++selectedComponentIndex >= components.length) selectedComponentIndex = 0;
        selectedComponent = components[selectedComponentIndex];
      }
    }
  };

  const selectPreviousComponent = () => {
    if(hasSelectable(components)) {
      do {
        if(--selectedComponentIndex < 0) selectedComponentIndex = components.length - 1;
        selectedComponent = components[selectedComponentIndex];
      } while(!selectedComponent || selectedComponent.type === 'label');
      focusIndex(selectedComponentIndex);
    }
  };

  const selectNextComponent = () => {
    if(hasSelectable(components)) {
      do {
        if(++selectedComponentIndex >= components.length) selectedComponentIndex = 0;
        selectedComponent = components[selectedComponentIndex];
      } while(!selectedComponent || selectedComponent.type === 'label');
      focusIndex(selectedComponentIndex);
    }
  };

  const componentCoords = (index: number) => {
    return {
      x: Math.floor(index / itemsPerColumn),
      y: index % itemsPerColumn,
    };
  };

  const coordsToIndex = (x: number, y: number) => {
    return x * itemsPerColumn + y;
  };

  const wrappedCoordsToIndex = (x: number, y: number) => {
    const length = components.length;
    const xMax = Math.floor((length - 1) / itemsPerColumn);
    if(x < 0) {
      x = xMax;
      while(coordsToIndex(x, y) >= length) { x--; }
    }
    if(x > xMax) x = 0;
    const yMax = Math.min(itemsPerColumn - 1, length - (x * itemsPerColumn) - 1);
    if(y < 0) {
      y = yMax;
      while(coordsToIndex(x, y) >= length) { y--; }
    }
    if(y > yMax) y = 0;
    return coordsToIndex(x,y);
  };

  const keyDown = (e: KeyboardEvent) => {
    const currentIndex = selectedComponentIndex;
    let newIndex = -1;
    if(components.length > 1) {
      const { x, y } = componentCoords(currentIndex);
      if(e.key === "ArrowUp") {
        e.preventDefault();
        newIndex = wrappedCoordsToIndex(x, y - 1);
      } else if(e.key === "ArrowDown") {
        e.preventDefault();
        newIndex = wrappedCoordsToIndex(x, y + 1);
      } else if(e.key === "ArrowLeft") {
        e.preventDefault();
        newIndex = wrappedCoordsToIndex(x - 1, y);
      } else if(e.key === "ArrowRight") {
        e.preventDefault();
        newIndex = wrappedCoordsToIndex(x + 1, y);
      }
    }
    if(newIndex >= 0 && components[newIndex]?.type !== "label") {
      selectedComponentIndex = newIndex;
      focusIndex(newIndex);
    }
  };

  const focusIndex = (index: number) => {
    const elem: any = menu.querySelector(`.game-ui[data-index='${index}']`);
    if(elem && "focus" in elem) {
      elem.focus();
      return elem as HTMLElement;
    }
    return null;
  }

  onMount(() => {
    focusIndex(selectedComponentIndex);
  });
</script>

<!-- Device Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Menu -->
<div id="menu" on:keydown={keyDown} transition:fade={{ duration: 250 }} bind:this={menu}>
  <h3>{@html title ?? "menu"}</h3>
  <div class="buttons">
    {#each components as component, i}
      <!-- NOTE: Make sure out transition is done before the parent transition! (DOM bug) -->
      <div
        style:grid-row={i % itemsPerColumn + 1}
        style:grid-column={Math.floor(i / itemsPerColumn) + 1}
        in:fly={{ duration: 150, delay: 100 + 100 * componentCoords(i).y, y: 50 }}
      >
        {#if component}
          {#if component.type === "button"}
            <UIButtonSvelte button={asButton(component)} index={i} />
          {:else if component.type === "number"}
            <UINumberInputSvelte input={asNumberInput(component)} index={i} />
          {:else if component.type === "label"}
            <UILabelSvelte label={asLabel(component)} />
          {:else if component.type === "chain"}
            <UIChainInputSvelte input={asChainInput(component)} index={i} />
          {/if}
        {/if}
      </div>
    {/each}
  </div>
</div>

<!-- Style -->
<style>
  #menu {
    box-sizing: border-box;
    position: absolute;
    inset: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: #0006;
  }

  #menu > :global(*) {
    box-sizing: border-box;
    width: 20rem;
    max-width: 95%;
  }

  #menu > .buttons {
    display: grid;
    grid-auto-rows: auto;
    grid-auto-columns: auto;
    grid-gap: 0.5rem;
  }

  #menu > .buttons > div {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
</style>