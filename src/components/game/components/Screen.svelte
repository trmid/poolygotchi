
<!-- Screen -->
<div id="screen">
  <div id="wrapper">
    <slot></slot>
  </div>
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
    box-sizing: border-box;
  }
  #screen::after {
    content: "";
    position: absolute;
    inset: -6px;
    border-radius: inherit;
    border: 3px solid var(--c3);
    pointer-events: none;
  }
  #wrapper {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 9%;
  }
</style>