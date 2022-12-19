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

  // Update account avatar on resolution:
  let avatarList: string[] = [];
  $: $account && resolveAccountAvatar($account);
  function resolveAccountAvatar(a: Account) {
    avatarList = [];
    a.allAvatars().then(avatars => {
      if(a == $account) {
        console.log("Fetched avatars:", avatars);
        avatarList = avatars.map(x => x.url);
        if(avatarList.length > 0) {
          if($account.avatar !== avatarList[0]) {
            $account.avatar = avatarList[0];
          }
        }
      }
    }).catch(console.error);
  }

  // UI Variables:
  let showAccountOptions = false;
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

    <!-- Disconnect -->
    <button on:click|stopPropagation={() => disconnect().catch(console.error)}>
      disconnect
    </button>
  </div>
  {/if}

</div>
{:else}
<button on:click={() => connect().catch(console.error)}>connect</button>
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
  }
  #address {
    margin-left: calc(0.5rem + var(--avatar-height));
  }
</style>