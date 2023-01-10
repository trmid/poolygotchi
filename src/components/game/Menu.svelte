<script type="ts">
  import type { UIButton, UIComponent } from "./game";
  import { gameUI } from "./Game.svelte";
  import UIButtonSvelte from "./UIButton.svelte";

  const asButton = (component: UIComponent): UIButton => {
    if(component.type === "button") return component as UIButton;
    throw new Error("expected button");
  };

  const keyDown = (e: KeyboardEvent) => {
    const ui = $gameUI;
    if(e.key === "ArrowUp") {
      e.preventDefault();
      ui.menu.index = Math.max(0, ui.menu.index - 1);
    } else if(e.key === "ArrowDown") {
      e.preventDefault();
      ui.menu.index = Math.min(ui.menu.components.length - 1, ui.menu.index + 1);
    }
    gameUI.replace(ui);
  };
</script>

<div id="menu" on:keydown={keyDown}>
  <h3>menu</h3>
  {#each $gameUI.menu.components as component, i}
    {#if component.type === "button"}
      <UIButtonSvelte button={asButton(component)} selected={$gameUI.menu.index == i} />
    {/if}
  {/each}
</div>

<!-- Style -->
<style>
  #menu {
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
</style>