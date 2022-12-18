<!-- Component -->
<script lang="ts">
	import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import { page, routes } from "./routes";
  import ConnectOverlay from "./components/ConnectOverlay.svelte";
</script>

<!-- Header -->
<Header />

<!-- Router -->
<Router {routes} on:routeLoaded={(e) => page.set(e.detail)} />

<!-- Footer -->
<Footer />

<!-- Connect Overlay -->
<ConnectOverlay />