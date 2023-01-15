
<!-- Screen -->
<div id="screen">
  <slot></slot>  
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