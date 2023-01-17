<script type="ts">
  import { link } from "svelte-spa-router";
  import { page } from "../routes";
  import Account from "./Account.svelte";

  // Navigation Vars:
  let nav: HTMLElement | undefined;
  let stickyNav = false;
  let checkingSticky = false;
  const checkSticky = () => {
    if(nav && !checkingSticky) {
      checkingSticky = true;
      const bb = nav.getBoundingClientRect();
      stickyNav = bb.top == 0;
      requestAnimationFrame(() => checkingSticky = false);
    }
  };

  // Connection Vars:

</script>

<!-- Event Listeners -->
<svelte:body on:scroll={checkSticky} />

<!-- Navigation -->
<nav class="margins" class:sticky={stickyNav} bind:this={nav}>
  <Account/>
  <a class="btn pulse" class:outline={$page?.location === "/"} href="/" use:link>play</a>
  <a class="btn pulse" class:outline={$page?.location === "/about"} href="/about" use:link>about</a>
</nav>

<!-- Style -->
<style>
  nav {
    isolation: isolate;
    z-index: 10;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    position: -webkit-sticky;
    position: sticky;
    top: 0;    
  }

  nav::before {
    content: "";
    z-index: -1;
    position: absolute;
    inset: 0;
    background-color: var(--c0);
    box-shadow: 0 2px 7px var(--shadow-color);
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  nav.sticky::before {
    opacity: 1;
  }

  @media screen and (min-width: 720px) {
    nav {
      padding-top: 2rem;
    }

    nav.sticky::before {
      top: 1rem;
      border-radius: 0.5rem;
    }

    nav > :global(a), nav > :global(button) {
      min-width: 4rem;
    }
  }
</style>