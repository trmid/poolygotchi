<script type="ts">
  export let installState: "installing" | "installed" | "activating" | "activated" | "parsed" | "redundant";
  let progress = 0;
  $: installState, updateProgress();
  const updateProgress = () => {
    switch(installState) {
      case "installing": progress = 0.4; break;
      case "installed": progress = 0.8; break;
      case "activating": progress = 1; break;
      case "activated": progress = 1; break;
    }
  };
</script>

<!-- Splash -->
<div id="splash">
  <div id="wrapper">
    <img src="img/spinner.svg" alt="loading..." style:opacity={progress}>
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
    transition: opacity 0.5s ease-out;
  }

  img {
    display: block;
    width: 256px;
  }

  #wrapper {
    position: relative;
  }
</style>