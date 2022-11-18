<script type="ts">
  import { link } from "svelte-spa-router";
  import { page } from "../routes";

  $: console.log($page);
</script>

<!-- Navigation -->
<nav>
  <a class="btn" class:selected={$page?.location === "/"} href="/" use:link>play</a>
  <a class="btn" class:selected={$page?.location === "/about"} href="/about" use:link>about</a>
</nav>

<!-- Style -->
<style>
  a.btn.selected {
    outline: 1px solid #fff5;
  }
</style>