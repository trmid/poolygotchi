<!-- Component -->
<script type="ts">
  import { showMenu } from "./Game.svelte";
  import Menu from "./Menu.svelte";
  import { poolygotchi } from "./Game.svelte";
  import { Poolygotchi } from "../../utils/poolygotchi";
  import { normalizeImageURI } from "../../utils/uri";
</script>

<!-- Screen -->
<div id="screen">

  <!-- Game elements go here -->
  {#if $poolygotchi}
    {#await $poolygotchi.rawData() then data}
      {#await Poolygotchi.function("environmentURI")(data.environmentId) then uri}
        {#await normalizeImageURI(uri + "/environment.png", "image/png") then environmentImageURI}
        <img id="background" src="{environmentImageURI}" alt="background environment" />
        {/await}
      {/await}
    {/await}
  {/if}

  <!-- TODO: remove test environment -->
  <img id="background" src="assets/environments/0-living-room/environment.png" alt="background environment" />

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

  #background {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
  }
</style>