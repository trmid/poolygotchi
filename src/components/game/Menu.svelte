<script type="ts">
  import type { UIButton, UIComponent } from "./game";
  import { menuComponents, menuSelectedIndex, showMenu } from "./Game.svelte";
  import UIButtonSvelte from "./UIButton.svelte";

  const asButton = (component: UIComponent): UIButton => {
    if(component.type === "button") return component as UIButton;
    throw new Error("expected button");
  };

  const keyDown = (e: KeyboardEvent) => {
    if(e.key === "ArrowUp") {
      e.preventDefault();
      $menuSelectedIndex = Math.max(0, $menuSelectedIndex - 1);
    } else if(e.key === "ArrowDown") {
      e.preventDefault();
      $menuSelectedIndex = Math.min($menuComponents.length - 1, $menuSelectedIndex + 1);
    }
  };
</script>

<div id="menu" on:keydown={keyDown}>
  <h3>menu</h3>
  {#each $menuComponents as component, i}
  {#if component.type === "button"}
  <UIButtonSvelte button={asButton(component)} selected={$menuSelectedIndex == i} />
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