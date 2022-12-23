<!-- Component -->
<script type="ts">
  import { showMenu } from "./Game.svelte";
  import { poolygotchi } from "./Game.svelte";
  import Menu from "./Menu.svelte";
  import Environment from "./Environment.svelte";
  import Poolygotchi from "./Poolygotchi.svelte";
</script>

<!-- Screen -->
<div id="screen">

  <!-- Game elements go here -->
  {#if $poolygotchi}
    {#await $poolygotchi.data() then data}

      <!-- Environment -->
      <Environment environmentId={data.environmentId} />

      <!-- Poolygotchi -->
      <Poolygotchi poolygotchi={$poolygotchi} />

    {/await}
  {/if}

  <!-- Menu -->
  {#if $showMenu}
  <Menu />
  {/if}
</div>

<!-- Style -->
<style>
  #screen {
    position: relative;
    width: var(--game-size);
    height: var(--game-size);
    border-radius: 10%;
    background-color: var(--c3);
    background: var(--tri-gradient);
    border: 3px solid var(--c0);
    outline: 3px solid var(--c3);
    box-sizing: border-box;
    overflow: hidden;
  }
</style>