<script lang="ts">
	import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import { routes } from "./routes";
</script>

<!-- Header -->
<Header />

<!-- Main -->
<main class="margins">

  <!-- Router -->
	<Router {routes}/>

</main>

<!-- Footer -->
<Footer />