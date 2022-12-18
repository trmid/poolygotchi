<script type="ts">
  import Screen from "./Screen.svelte";

  const interact = async () => {
    try {
      console.log("interacted");
    } catch (err) {
      console.error(err);
    }
  }
</script>

<!-- Device Container -->
<div id="device">
  <Screen />
  <div id="buttons">
    <button title="Home" id="home-btn"><i class="icofont-ui-home" /></button>
    <button title="Interact!" id="interact-btn" on:click={interact}><i class="icofont-comment" /></button>
    <button title="Menu" id="menu-btn"><i class="icofont-navigation-menu" /></button>
  </div>
</div>

<!-- Style -->
<style>
  #device {
    position: relative;
    width: 300px;
    height: 360px;
    margin: 1rem 0;
    background-color: var(--c0);
    border-radius: 50%;
  }

  #buttons {
    position: absolute;
    bottom: 12%;
    left: 15%;
    right: 15%;
    height: 20%;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: center;
  }

  #buttons > button {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 120%;
    width: 36px;
    min-width: 0;
    padding: 0;
    height: 36px;
    color: var(--c0);
    background-color: var(--c3);
    border: 2px solid var(--c0);
    outline: 2px solid var(--c3);
    border-radius: 50%;
    cursor: pointer;
  }

  #buttons > button:active {
    background: var(--tri-gradient);
  }

  #interact-btn {
    top: 20%;
    scale: 1.1;
  }

  @media screen and (max-width: 320px) {
    #device {
      width: 200px;
      height: 240px;
    }
  }

  @media screen and (min-width: 1024px) {
    #device {
      width: 450px;
      height: 540px;
    }
  }
</style>