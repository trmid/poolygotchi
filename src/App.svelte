<!-- Component -->
<script lang="ts">
	import Router from "svelte-spa-router";
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import { page, routes } from "./routes";
  import ConnectOverlay from "./components/ConnectOverlay.svelte";
  import Notifications from "./components/Notifications.svelte";
  import Focus from "./components/Focus.svelte";
  import Time from "./components/Time.svelte";
  import ServiceWorker from "./components/ServiceWorker.svelte";
</script>

<!-- Service Worker -->
<ServiceWorker />

<!-- Header -->
<Header />

<!-- Router -->
<Router {routes} on:routeLoaded={(e) => page.set(e.detail)} />

<!-- Footer -->
<Footer />

<!-- Connect Overlay -->
<ConnectOverlay />

<!-- Notifications -->
<Notifications />

<!-- Focus -->
<Focus />

<!-- Time -->
<Time />
