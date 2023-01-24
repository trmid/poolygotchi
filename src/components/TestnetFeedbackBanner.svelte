<script type="ts">
  import { fly } from "svelte/transition";
  import { account } from "./Account.svelte";

  let showBanner = false;

  $: $account, checkIfEligible();

  const checkIfEligible = async () => {
    if($account) {
      const poolygotchi = await $account.poolygotchi();
      if(poolygotchi) {
        const data = await poolygotchi.data();
        console.log(data.hatchDate);
        if(data.hatchDate.lt(Math.floor(Date.now() / 1000) - (60*60))) {
          showBanner = true;
        }
      }
    }
  };
</script>

<!-- Banner -->
{#if showBanner}
  <div id="banner" transition:fly={{ duration: 1000, y: -100 }}>
    <div>
      <span>👋 How's it going? Let us know!</span>
      <div>
        <a class="btn pulse" href="https://forms.gle/8sNiGzjSciTjcUEJ6" target="_blank" rel="noreferrer">Give Feedback</a>
        <button class="pulse" on:click={() => showBanner = false}>close</button>
      </div>
    </div>
  </div>
{/if}

<!-- Style -->
<style>
  #banner {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    max-width: 95vw;
    border-radius: 1rem;
    background-color: var(--c3);
    background: var(--tri-gradient);
    box-shadow: 3px 3px 7px var(--shadow-color);
    z-index: 10;
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