
<!-- Content -->
<div id="container">
  <h3>Welcome!</h3>
  <img id="welcome-pooly" src="assets/species/0/neutral.gif" alt="pooly bird standing animation" />
  <p>Connect to hatch a Poolygotchi!</p>
</div>

<!-- Style -->
<style>
  #container {
    position: absolute;
    inset: 0;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    background-color: #0004;
  }

  #welcome-pooly {
    width: calc(var(--game-size) * 0.4);
  }
</style>