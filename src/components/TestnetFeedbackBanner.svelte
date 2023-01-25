<script type="ts">
  import { fly } from "svelte/transition";
  import { account } from "./Account.svelte";

  const storageKey = {
    lastClosed: "feedbackForm:lastClosed",
    clicked: "feedbackForm:clicked"
  };

  let showBanner = false;

  $: $account, checkIfEligible();

  const checkIfEligible = async () => {
    if($account && (localStorage.getItem(storageKey.clicked) !== "true")) {
      const poolygotchi = await $account.poolygotchi();
      if(poolygotchi) {
        const data = await poolygotchi.data();
        console.log(data.hatchDate);
        if(data.hatchDate.lt(Math.floor(Date.now() / 1000) - (60*60))) {
          let lastClosed = parseInt(localStorage.getItem(storageKey.lastClosed) ?? "0");
          if(Date.now() - lastClosed > (1000 * 60 * 60 * 24)) {
            setTimeout(() => {
              showBanner = true;
            }, 5000);
          }
        }
      }
    }
  };

  const close = () => {
    showBanner = false;
    localStorage.setItem(storageKey.lastClosed, "" + Date.now());
  };
</script>

<!-- Banner -->
{#if showBanner}
  <div id="container">
    <div id="banner" transition:fly={{ duration: 1000, y: -100 }}>
      <div>
        <span>👋 How's it going? Let us know!</span>
        <div>
          <a class="btn pulse" href="https://forms.gle/8sNiGzjSciTjcUEJ6" target="_blank" rel="noreferrer" on:click={() => { showBanner = false; localStorage.setItem(storageKey.clicked, "true"); }}>Give Feedback</a>
          <button class="pulse" on:click={close}>close</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Style -->
<style>
  #container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }

  #banner {
    position: relative;
    margin: 3rem auto 0 auto;
    width: 500px;
    max-width: 90vw;
    border-radius: 1rem;
    background-color: var(--c3);
    background: var(--tri-gradient);
    box-shadow: 3px 3px 7px var(--shadow-color);
    box-sizing: border-box;
    padding: 3px;
  }

  #banner > div {
    content: "";
    border-radius: 1rem;
    background-color: var(--c0);
    background: var(--bg-gradient);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    gap: 0.5rem;
    font-size: 16px;
  }

  button, .btn {
    font-size: 16px;
  }
</style>