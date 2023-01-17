<script type="ts">
  export let prev: () => void;
  export let next: () => void;
</script>

<!-- Carousel -->
<div id="carousel">
  <button on:click={prev}><i class="icofont-caret-left" /></button>
  <slot></slot>
  <button on:click={next}><i class="icofont-caret-right" /></button>
</div>

<!-- Style -->
<style>
  #carousel {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  #carousel > button {
    font-size: 24px;
    padding: 0;
    min-width: 0;
    width: 32px;
    height: 32px;
  }
</style>