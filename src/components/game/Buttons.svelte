<!-- Component -->
<script type="ts">
  const interact = async () => {
    try {
      console.log("interacted");
    } catch (err) {
      console.error(err);
    }
  };
</script>

<!-- Content -->
<div id="buttons">
  <button title="Home" id="home-btn"><i class="icofont-ui-home" /></button>
  <button title="Interact!" id="interact-btn" on:click={interact}><i class="icofont-comment" /></button>
  <button title="Menu" id="menu-btn"><i class="icofont-navigation-menu" /></button>
</div>

<!-- Style -->
<style>
  #buttons {
    margin-top: 1rem;
    height: 8rem;
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
    font-size: 24px;
    width: 64px;
    min-width: 0;
    padding: 0;
    height: 64px;
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
</style>