<script type="ts">
  import type { UIButton, UIComponent } from "./game";
  import { menuComponents, menuSelectedIndex, showMenu } from "./Game.svelte";
  import UIButtonSvelte from "./UIButton.svelte";

  const asButton = (component: UIComponent): UIButton => {
    if(component.type === "button") return component as UIButton;
    throw new Error("expected button");
  }
</script>

<div id="menu">
  <h3>menu</h3>
  {#each $menuComponents as component}
  {#if component.type === "button"}
  <UIButtonSvelte button={asButton(component)} />
  {/if}
  {/each}
</div>

<!-- Style -->
<style>
  #menu {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 0.5rem;
    background-color: #0004;
  }
</style>