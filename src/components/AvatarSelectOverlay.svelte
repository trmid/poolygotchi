<script lang="ts">
  import Overlay from "./Overlay.svelte";
  import { time } from "./Time.svelte";
  import { account } from "./Account.svelte";
  import type { Account, BaseAccount } from "../utils/account";

  export let close: () => void;

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

</script>

<Overlay {close} width={300}>
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
          <button class="pulse avatar-option icofont-" on:click={() => $account && ($account.avatar = url) && close()} class:selected={url === $account?.avatar}>
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

<style>
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