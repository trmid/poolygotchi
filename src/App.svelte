<!-- Module -->
<script type="ts" context="module">
  export const page = writable<RouteDetailLoaded | null>(null);
</script>

<!-- Component -->
<script lang="ts">
	import Router, { RouteDetailLoaded } from "svelte-spa-router";
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import { routes } from "./routes";
  import { writable } from "svelte/store";
</script>

<!-- Header -->
<Header />

<!-- Main -->
<main class="margins">

  <!-- Router -->
	<Router {routes} on:routeLoaded={(e) => page.set(e.detail)} />

</main>

<!-- Footer -->
<Footer />