<script lang="ts">
	import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";
  import { routes } from "./routes";
</script>

<!-- Header -->
<Header />

<!-- Main -->
<main class="margins">

  <!-- Router -->
	<Router {routes}/>

</main>

<!-- Global CSS -->
<style>
  @font-face {
    font-family: Comfortaa;
    src: url(style/Comfortaa.ttf);
  }

  :global(html, body) {
    margin: 0;
    padding: 0;
    font-family: Comfortaa, sans-serif;
  }

  :global(.margins) {
    margin: 0 auto;
    padding: 1rem;
    max-width: 1024px;
  }
</style>