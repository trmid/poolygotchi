<script type="ts">
  import Screen from "./Screen.svelte";
</script>

<!-- Device Container -->
<div id="device">
  <Screen />
  <div id="buttons">
    <div title="Home" id="home-btn" class="btn"><i class="icofont-ui-home" /></div>
    <div title="Interact!" id="interact-btn" class="btn"><i class="icofont-comment" /></div>
    <div title="Menu" id="menu-btn" class="btn"><i class="icofont-navigation-menu" /></div>
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

  .btn {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 120%;
    width: 36px;
    height: 36px;
    color: var(--c0);
    background-color: var(--c3);
    border: 2px solid var(--c0);
    outline: 2px solid var(--c3);
    border-radius: 50%;
    cursor: pointer;
  }

  .btn:active {
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