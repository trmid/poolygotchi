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
  import Overlay from "./Overlay.svelte";
  import { time } from "./Time.svelte";
  import { fade, fly } from "svelte/transition";

  // Update account avatar on resolution:
  let accountAddress: string = "";
  let avatarList: Awaited<ReturnType<BaseAccount["allAvatars"]>> = [];
  let maxAvatars = 10;
  let fetchingAvatars = false;
  $: $account && resolveAccountAvatar($account);

  async function resolveAccountAvatar(a: Account) {
    try {

      // Don't load unless address has changed on account:
      if(a.address === accountAddress) return;
      accountAddress = a.address;

      // Set immediately available avatars:
      avatarList = [{ url: a.defaultAvatar, category: "Blockies", weight: 0 }];
      if(a.defaultAvatar !== a.avatar) avatarList = [{ url: a.avatar, category: "Saved Avatar", weight: 2 }, ...avatarList];

      // Fetch other avatar options:
      fetchingAvatars = true;
      await a.allAvatars().then(async avatars => {

        // Check if active account is still the account we were fetching for:
        if(a == $account) {

          // Set avatar to highest weight uri (if not set before):
          avatarList = avatars;
          maxAvatars = 10;
          if(avatarList.length > 0) {
            const resolvedURL = await resolveAvatarURL(avatarList[0].url);
            if(!a.storedAvatar && resolvedURL !== $account.defaultAvatar) {
              a.avatar = resolvedURL;
            }
          }
        } else {
          console.warn(`Loaded avatars for ${a.address}, which does not match ${$account?.address}`);
        }
      });
    } catch(err) {
      console.error(err);
    } finally {
      fetchingAvatars = false;
    }
  }

  // Function to resolve an avatar url:
  async function resolveAvatarURL(url: typeof avatarList[0]["url"]) {
    return typeof url === "string" ? url : await url();
  }

  // UI Variables:
  let showAccountOptions = false;
  let showAvatarSelector = false;
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

    <!-- Disconnect -->
    <button class="pulse" on:click={() => disconnect().catch(console.error)} in:fly={{ x: 50, duration: 200, delay: 150 }}>
      disconnect
    </button>
  </div>
  {/if}

</div>
{:else}
<button class="pulse" on:click={() => connect().catch(console.error)}>connect</button>
{/if}

<!-- Avatar Selector -->
{#if showAvatarSelector}
<Overlay close={() => showAvatarSelector = false} width={300}>
  <h3>select an avatar</h3>
  <p>
    <i>{avatarList.length} option{avatarList.length > 1 ? 's' : ''} found</i>
    {#if fetchingAvatars}
      <i>(searching{#each (new Array(Math.floor($time / 1000) % 3 + 1)).fill(0) as _}.{/each})</i>
    {/if}
  </p>
  <div id="avatar-selector">
    {#each avatarList as avatar, i}
      {#if i < maxAvatars}
        {#await resolveAvatarURL(avatar.url)}
          <button class="avatar-option icofont-">
            <span class="avatar loading" />
          </button>
        {:then url}
          <button class="pulse avatar-option icofont-" on:click={() => $account && ($account.avatar = url) && (showAvatarSelector = false)} class:selected={url === $account?.avatar}>
            <img class="avatar" src={url} alt="avatar option #{i}">
            {#if avatar.category === "ENS - Avatar"}
              <img class="ens-pin" src="img/ens.webp" alt="">
            {/if}
          </button>
        {/await}
      {/if}
    {/each}
    {#if maxAvatars < avatarList.length}
      <button on:click={() => maxAvatars += 10}>load more...</button>
    {/if}
  </div>
</Overlay>
{/if}

<!-- Style -->
<style>
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
  #avatar-selector {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0.5rem;
    --avatar-size: 38px;
    overflow-y: auto;
    max-height: 60vh;
    padding: 0.5rem;
  }
  .avatar-option {
    position: relative;
    padding: 0;
    min-width: 0;
    background: var(--bg-gradient);
    border-radius: 0.5rem;
  }
  .avatar-option > .avatar {
    position: relative;
    display: block;
    width: var(--avatar-size);
    height: var(--avatar-size);
    z-index: 1;
    border-radius: calc(0.8 * var(--border-radius));
  }
  .avatar-option::before {
    content: "\eff5";
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    animation-name: spin;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    animation-play-state: running;
    animation-timing-function: linear;
  }
  .avatar-option > img.ens-pin {
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    top: 1px;
    left: 1px;
    border: 1px solid var(--c3);
    position: absolute;
    z-index: 1;
  }
  .avatar-option.pulse.selected,
  .avatar-option.pulse.selected::after {
    border-color: var(--c2);
    --pulse-color: var(--c2) !important;
  }
  .avatar-option.pulse.selected::after {
    z-index: 1;
  }
</style>