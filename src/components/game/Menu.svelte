<script type="ts">
  import type { UIButton, UIComponent } from "./game";
  import { gameUI } from "./Game.svelte";
  import UIButtonSvelte from "./UIButton.svelte";
  import { fade, fly } from "svelte/transition";

  const itemsPerColumn = 4;

  const asButton = (component: UIComponent): UIButton => {
    if(component.type === "button") return component as UIButton;
    throw new Error("expected button");
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
    const length = $gameUI.menu.components.length;
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
    const ui = $gameUI;
    if(ui.menu.components.length > 1) {
      const { x, y } = componentCoords(ui.menu.index);
      if(e.key === "ArrowUp") {
        e.preventDefault();
        ui.menu.index = wrappedCoordsToIndex(x, y - 1);
      } else if(e.key === "ArrowDown") {
        e.preventDefault();
        ui.menu.index = wrappedCoordsToIndex(x, y + 1);
      } else if(e.key === "ArrowLeft") {
        e.preventDefault();
        ui.menu.index = wrappedCoordsToIndex(x - 1, y);
      } else if(e.key === "ArrowRight") {
        e.preventDefault();
        ui.menu.index = wrappedCoordsToIndex(x + 1, y);
      }
      gameUI.replace(ui);
    }
  };
</script>

<div id="menu" on:keydown={keyDown} transition:fade={{ duration: 250 }}>
  <h3>menu</h3>
  <div class="buttons">
    {#each $gameUI.menu.components as component, i}
      {#if component.type === "button"}
        <div
          style:grid-row={i % itemsPerColumn + 1}
          style:grid-column={Math.floor(i / itemsPerColumn) + 1}
          in:fly={{ duration: 150, delay: 100 + 100 * componentCoords(i).y, y: 50 }}
          out:fly={{ duration: 150, delay: 100 * componentCoords(itemsPerColumn - i - 1).y, y: 50 }}
        >
          <UIButtonSvelte button={asButton(component)} selected={$gameUI.menu.index == i} />
        </div>
      {/if}
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
    width: 16rem;
    max-width: 90%;
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