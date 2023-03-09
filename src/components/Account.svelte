<!-- Module -->
<script type="ts" context="module">
  import { get, writable } from "svelte/store";
  import type { AccountWithSigner, Account, BaseAccount } from "../utils/account";
  export const account = writable<AccountWithSigner | null>(null);
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
  import { fade, fly } from "svelte/transition";
  import AvatarSelectOverlay from "./AvatarSelectOverlay.svelte";
    import AccountSettings from "./AccountSettings.svelte";

  // UI Variables:
  let showAccountOptions = false;
  let showAvatarSelector = false;
  let showSettings = false;
  const toggleAccountOptions = (state = !showAccountOptions) => showAccountOptions = state;
</script>

<!-- Window -->
<svelte:window
  on:click={() => toggleAccountOptions(false)}
  on:keydown={ifEnter(() => toggleAccountOptions(false))}
/>

{#if $account}
<div id="account" class:raised={showAccountOptions}>

  <!-- Avatar Image -->
  <button id="avatar" class="btn pulse" title="account" on:click|stopPropagation={() => toggleAccountOptions()}>
    <img src="{$account.avatar}" alt="User Avatar">
  </button>

  <!-- Account Options -->
  {#if showAccountOptions}
  <div
    id="options"
    on:click|stopPropagation
    on:keydown|stopPropagation
    out:fade={{ duration: 100 }}
  >

    <!-- Account Address -->
    <div id="address" in:fly={{ x: 50, duration: 200, delay: 50 }}>
      {#await $account.ensName()}
      <Address address={$account.address}/>
      {:then name}
      <Address address={$account.address} {name}/>
      {:catch err}
      <Address address={$account.address}/>
      {/await}
    </div>

    <!-- Avatar Change -->
    <button class="pulse" on:click={() => showAvatarSelector = true} in:fly={{ x: 50, duration: 200, delay: 100 }}>
      change avatar
    </button>

    <!-- Settings -->
    <button class="pulse" on:click={() => showSettings = true} in:fly={{ x: 50, duration: 200, delay: 150 }}>
      settings
    </button>

    <!-- Disconnect -->
    <button class="pulse" on:click={() => disconnect().catch(console.error)} in:fly={{ x: 50, duration: 200, delay: 200 }}>
      disconnect
    </button>
  </div>
  {/if}

</div>
{:else}
<button id="connect-btn" class="pulse" on:click={() => connect().catch(console.error)}>connect</button>
{/if}

<!-- Avatar Selector -->
{#if showAvatarSelector}
  <AvatarSelectOverlay close={() => showAvatarSelector = false} />
{/if}

<!-- Settings -->
{#if showSettings}
  <AccountSettings close={() => showSettings = false} />
{/if}

<!-- Style -->
<style>
  #connect-btn {
    font-size: inherit;
  }
  #account {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    --avatar-size: 38px;
  }
  #account.raised {
    z-index: 2;
  }
  #avatar {
    min-width: 0;
    width: var(--avatar-size);
    height: var(--avatar-size);
    padding: 0;
  }
  #avatar > img {
    position: relative;
    display: block;
    width: var(--avatar-size);
    height: var(--avatar-size);
    left: -1px;
    top: -1px;
    border-radius: calc(0.8 * var(--border-radius));
  }
  #avatar:hover {
    cursor: pointer;
  }
  #avatar::after {
    width: var(--avatar-size);
    height: var(--avatar-size);
  }
  #options {
    position: absolute;
    z-index: -1;
    padding: 0.5rem;
    left: -0.5rem;
    top: -0.5rem;
    box-shadow: var(--box-shadow);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: 1rem;
    background-color: var(--c3);
    background: var(--bg-gradient);
    width: max-content;
    border: 3px solid var(--c0);
    overflow: hidden;
  }
  #address {
    margin-left: calc(0.5rem + var(--avatar-size));
  }
</style>