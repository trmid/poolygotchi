<script type="ts">
  import { fade } from "svelte/transition";
</script>

<!-- Splash -->
<div id="splash" out:fade={{ duration: 1000 }}>
  <div id="wrapper">
    <img src="img/spinner.svg" alt="loading...">
  </div>
</div>

<!-- Style -->
<style>
  #splash {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--c0);
    background: var(--bg-gradient);
  }

  img {
    display: block;
    width: 256px;
  }

  #wrapper {
    position: relative;
  }
</style>