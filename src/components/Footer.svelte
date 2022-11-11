<script type="ts">
  import { link } from "svelte-spa-router";
</script>

<!-- Footer -->
<footer class="margins">
  <a href="/" use:link>play</a>
  <a href="/about" use:link>about</a>
</footer>

<!-- Style -->
<style>
  footer {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  a {
    width: 4rem;
    text-align: center;
    display: inline-block;
    background-color: var(--c0);
    border-radius: 5px;
    padding: 7px 10px;
    text-decoration: none;
  }
</style>