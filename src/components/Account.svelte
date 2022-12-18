<!-- Module -->
<script type="ts" context="module">
  import { get, writable } from "svelte/store";
  import type Account from "../utils/account";
  export const account = writable<Account | null>(null);
  export const disconnect = async () => {
    return get(account)?.disconnect().then(() => {
      account.set(null);
    });
  };
</script>

<!-- Component -->
<script type="ts">
  import ifEnter from "../utils/key";
  import Address from "./Address.svelte";
    import { connect } from "./ConnectOverlay.svelte";

  // UI Variables:
  let showAccountInfo = false;
  const toggleAccountInfo = (state = !showAccountInfo) => showAccountInfo = state;
</script>

<!-- Window -->
<svelte:window
  on:click={() => toggleAccountInfo(false)}
  on:keydown={ifEnter(() => toggleAccountInfo(false))}
/>

{#if $account}
<div id="account">
  {#if showAccountInfo}
  <button on:click|stopPropagation={() => disconnect().catch(console.error)}>
    disconnect
  </button>
  {:else}
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <img
    id="avatar"
    class="border hover"
    src="{$account.avatar}"
    alt="User Avatar"
    tabindex="0"
    on:click|stopPropagation={() => toggleAccountInfo(true)}
    on:keydown|stopPropagation={ifEnter(() => toggleAccountInfo(true))}>
  <Address address={$account.address} />
  {/if}
</div>
{:else}
<button on:click={() => connect().catch(console.error)}>connect</button>
{/if}

<!-- Style -->
<style>
  #account {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  #avatar {
    border-radius: 50%;
  }
</style>