<!-- Module -->
<script type="ts" context="module">
  export interface UIComponent {
    type: 'button' | 'number'
  }

  export interface UIButton extends UIComponent {
    type: 'button'
    name: string
    disabled?: boolean
    title?: string
    action: () => any
  }

  export interface UINumberInput extends UIComponent {
    type: 'number'
    placeholder?: string
    disabled?: boolean
    initialValue?: number
    min?: number
    max?: number
    step?: number
    onChange: (value: number) => void
  }

  export const asButton = (component: UIComponent): UIButton => {
    if(component.type === "button") return component as UIButton;
    throw new Error("expected button");
  };

  export const asNumberInput = (component: UIComponent): UINumberInput => {
    if(component.type === "number") return component as UINumberInput;
    throw new Error("expected number");
  };
</script>

<!-- Component -->
<script type="ts">
  import { fade, fly } from "svelte/transition";
  import UIButtonSvelte from "./UIButton.svelte";
  import UINumberInputSvelte from "./UINumberInput.svelte";

  // Props:
  export let title = "menu";
  export let components: UIComponent[];
  export let itemsPerColumn = 4;

  // Variables:
  let selectedComponentIndex = 0;

  // Functions:
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
    if(components.length > 1) {
      const { x, y } = componentCoords(selectedComponentIndex);
      if(e.key === "ArrowUp") {
        e.preventDefault();
        selectedComponentIndex = wrappedCoordsToIndex(x, y - 1);
      } else if(e.key === "ArrowDown") {
        e.preventDefault();
        selectedComponentIndex = wrappedCoordsToIndex(x, y + 1);
      } else if(e.key === "ArrowLeft") {
        e.preventDefault();
        selectedComponentIndex = wrappedCoordsToIndex(x - 1, y);
      } else if(e.key === "ArrowRight") {
        e.preventDefault();
        selectedComponentIndex = wrappedCoordsToIndex(x + 1, y);
      }
    }
  };
</script>

<div id="menu" on:keydown={keyDown} transition:fade={{ duration: 250 }}>
  <h3>{@html title ?? "menu"}</h3>
  <div class="buttons">
    {#each components as component, i}
      <div
        style:grid-row={i % itemsPerColumn + 1}
        style:grid-column={Math.floor(i / itemsPerColumn) + 1}
        in:fly={{ duration: 150, delay: 100 + 100 * componentCoords(i).y, y: 50 }}
        out:fly={{ duration: 150, delay: 100 * componentCoords(itemsPerColumn - i - 1).y, y: 50 }}
      >
        {#if component.type === "button"}
          <UIButtonSvelte button={asButton(component)} selected={selectedComponentIndex == i} onSelect={() => selectedComponentIndex = i} />
        {:else if component.type === "number"}
          <UINumberInputSvelte input={asNumberInput(component)} selected={selectedComponentIndex == i} onSelect={() => selectedComponentIndex = i} />
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
    background-color: #000a;
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