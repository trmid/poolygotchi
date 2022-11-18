<script type="ts">
  import { link } from "svelte-spa-router";
  import { page } from "../App.svelte";
</script>

<!-- Navigation -->
<nav>
  <a class="btn" class:selected={$page?.name === "Home"} href="/" use:link>play</a>
  <a class="btn" class:selected={$page?.name === "About"} href="/about" use:link>about</a>
</nav>

<!-- Style -->
<style>
  a.btn.selected {
    outline: 1px solid #fff5;
  }
</style>