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
  import Overlay from "./Overlay.svelte";

  // Update account avatar on resolution:
  let avatarList: string[] = [];
  $: $account && resolveAccountAvatar($account);
  function resolveAccountAvatar(a: Account) {
    a.allAvatars().then(avatars => {
      if(a == $account) {
        console.log("Fetched avatars:", avatars);
        // Set avatar to highest weight uri (if not set before)
        avatarList = avatars.map(x => x.url);
        if(avatarList.length > 0) {
          if(!$account.storedAvatar && avatarList[0] !== $account.defaultAvatar) {
            $account.avatar = avatarList[0];
          }
        }
      }
    }).catch(console.error);
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
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <img
    id="avatar"
    class="btn border hover"
    src="{$account.avatar}"
    alt="User Avatar"
    tabindex="0"
    title="account"
    on:click|stopPropagation={() => toggleAccountOptions()}
    on:keydown|stopPropagation={ifEnter(() => toggleAccountOptions())}>

  <!-- Account Options -->
  {#if showAccountOptions}
  <div id="options" on:click|stopPropagation on:keydown|stopPropagation>

    <!-- Account Address -->
    <div id="address">
      {#await $account.ensName()}
      <Address address={$account.address}/>
      {:then name}
      <Address address={$account.address} {name}/>
      {:catch err}
      <Address address={$account.address}/>
      {/await}
    </div>

    <!-- Avatar Change -->
    <button on:click={() => showAvatarSelector = true}>
      change avatar
    </button>

    <!-- Disconnect -->
    <button on:click={() => disconnect().catch(console.error)}>
      disconnect
    </button>
  </div>
  {/if}

</div>
{:else}
<button on:click={() => connect().catch(console.error)}>connect</button>
{/if}

<!-- Avatar Selector -->
{#if showAvatarSelector}
<Overlay close={() => showAvatarSelector = false} width={300}>
  <h3>select an avatar</h3>
  <p>
    <i>{avatarList.length} option{avatarList.length > 1 ? 's' : ''} found</i>
  </p>
  <div id="avatar-selector">
    {#each avatarList as avatar, i}
      <button class="avatar-option" on:click={() => $account && ($account.avatar = avatar) && (showAvatarSelector = false)} class:selected={avatar === $account?.avatar}>
        <img src={avatar} alt="avatar option #{i}">
      </button>
    {/each}
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
    --avatar-height: 38px;
  }
  #account.raised {
    z-index: 2;
  }
  #avatar {
    min-width: 0;
    max-height: var(--avatar-height);
    padding: 0;
  }
  #avatar:hover {
    outline: 1px solid #fff4;
    cursor: pointer;
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
    border-radius: 0.5rem;
    background-color: var(--c0);
    width: max-content;
  }
  #address {
    margin-left: calc(0.5rem + var(--avatar-height));
  }
  #avatar-selector {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .avatar-option {
    padding: 0;
    min-width: 0;
    background: var(--bg-gradient);
    overflow: hidden;
  }
  .avatar-option > img {
    display: block;
    width: 38px;
    height: 38px;
  }
  .avatar-option.selected {
    outline: 2px solid var(--c2);
  }
</style>