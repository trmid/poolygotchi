<script type="ts">
  import Screen from "./Screen.svelte";
  import Buttons from "./Buttons.svelte";
</script>

<!-- Device Container -->
<div id="device">
  <Screen />
  <Buttons />
</div>

<!-- Style -->
<style>
  #device {
    --game-size: 300px;
    width: var(--game-size);
    position: relative;
    margin: 1rem 0;
  }

  /* #device::before {
    content: "";
    position: absolute;
    z-index: -1;
    background-color: var(--c0);
    border-radius: 50%;
    top: -30%;
    bottom: -20%;
    left: -40%;
    right: -40%;
  } */

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