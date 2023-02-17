<script type="ts">
  export let prev: () => void;
  export let next: () => void;
</script>

<!-- Carousel -->
<div id="carousel">
  <button class="game-ui" on:click={prev}><i class="icofont-caret-left" /></button>
  <slot></slot>
  <button class="game-ui" on:click={next}><i class="icofont-caret-right" /></button>
</div>

<!-- Style -->
<style>
  #carousel {
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: var(--transparent-gradient);
    border-radius: 0.5rem;
    border: 1px solid #fffa;
    padding: 0.5rem;
    box-sizing: border-box;
  }

  #carousel > button {
    font-size: 24px;
    padding: 0;
    min-width: 0;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>