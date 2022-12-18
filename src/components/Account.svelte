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
            console.log("Setting avatar from:", $account.avatar, "to:", avatarList[0]);
            $account.avatar = avatarList[0];
          }
        }
      }
    }).catch(console.error);
  }

  // UI Variables:
  let showAccountOptions = false;
  const toggleAccountInfo = (state = !showAccountOptions) => showAccountOptions = state;
</script>

<!-- Window -->
<svelte:window
  on:click={() => toggleAccountInfo(false)}
  on:keydown={ifEnter(() => toggleAccountInfo(false))}
/>

{#if $account}
<div id="account">

  <!-- Avatar Image -->
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <img
    id="avatar"
    class="btn border hover"
    src="{$account.avatar}"
    alt="User Avatar"
    tabindex="0"
    on:click|stopPropagation={() => toggleAccountInfo()}
    on:keydown|stopPropagation={ifEnter(() => toggleAccountInfo())}>

  <!-- Account Options -->
  {#if showAccountOptions}
  <button on:click|stopPropagation={() => disconnect().catch(console.error)}>
    disconnect
  </button>
  {:else}

  <!-- Account Address -->
  {#await $account.ensName()}
  <Address address={$account.address}/>
  {:then name}
  <Address address={$account.address} {name}/>
  {:catch err}
  <Address address={$account.address}/>
  {/await}

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
    min-width: 0;
    width: 32px;
    padding: 0;
  }
  #avatar:hover {
    outline: 1px solid #fff4;
    cursor: pointer;
  }
</style>