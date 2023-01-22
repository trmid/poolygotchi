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
  import TestnetWelcome from "./components/TestnetWelcome.svelte";

  // Don't style the scroll bar on mobile devices:
  window.addEventListener("load", () => {
    if("screen" in window && window.screen.availWidth < 600) {
      document.body.classList.add("classic-scroll");
    }
  });
</script>

<!-- Header -->
<Header />

<!-- Router -->
<Router {routes} on:routeLoaded={(e) => page.set(e.detail)} />

<!-- Footer -->
<Footer />

<!-- Connect Overlay -->
<ConnectOverlay />

<!-- Testnet Disclaimer -->
<TestnetWelcome />

<!-- Notifications -->
<Notifications />

<!-- Focus -->
<Focus />

<!-- Time -->
<Time />

<!-- Service Worker -->
<ServiceWorker />