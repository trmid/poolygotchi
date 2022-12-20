<!-- Component -->
<script type="ts">
  import type { DeviceButtons } from "./game";
  export let buttons: DeviceButtons;
</script>

<!-- Content -->
<div id="buttons">
  <button title={buttons.left.title} id="left-btn" on:click={buttons.left.action}><i class={buttons.left.class} /></button>
  <button title={buttons.middle.title} id="middle-btn" on:click={buttons.middle.action}><i class={buttons.middle.class} /></button>
  <button title={buttons.right.title} id="right-btn" on:click={buttons.right.action}><i class={buttons.right.class} /></button>
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

  #middle-btn {
    top: 20%;
    scale: 1.1;
  }
</style>