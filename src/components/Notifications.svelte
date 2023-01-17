<!-- Module -->
<script type="ts" context="module">
  import { get, writable } from "svelte/store";
  export interface Notification {
    message: string
    type: 'error' | 'warning' | 'standard' | 'success'
    timestamp: number
    popup?: boolean
    title?: string
    hideDismissButton?: boolean
    persist?: boolean
  }
  export const notification = writable<Notification | null>(null);
  export const selectedNotification = writable<Notification | null>(null);
  export function pushNotification(_notification: Omit<Notification, "timestamp">) {
    (_notification as Notification).timestamp = Date.now();
    notification.set((_notification as Notification));
    return () => {
      if(get(notification) == _notification) notification.set(null);
      if(get(selectedNotification) == _notification) selectedNotification.set(null);
    };
  }
</script>

<!-- Component -->
<script type="ts">
  import Overlay from "./Overlay.svelte";
  import { time } from "./Time.svelte";
  import { fly, fade } from "svelte/transition";

  const notificationDuration = 9000;

  $: if($notification && $notification.popup) select($notification);

  function select(notification: Notification) {
    $selectedNotification = notification;
  }
</script>

<!-- Notifications -->
{#if $notification && ($notification.persist || ($time - $notification.timestamp < notificationDuration))}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  {#key $notification}
    <div
      id="notification"
      class={$notification.type}
      on:click={() => $selectedNotification = $notification}
      in:fly={{ y: 250 }}
      out:fade={{ duration: 1000 }}
    >
      {@html $notification.message}
    </div>
  {/key}
{/if}

<!-- Selected Notification -->
{#if $selectedNotification}
  {#key $selectedNotification}
    <Overlay close={() => $selectedNotification = null} width={400}>
      <h3 class={$selectedNotification.type}>
        {#if $selectedNotification.title}
          {$selectedNotification.title}
        {:else}
          {#if $selectedNotification.type === 'error'}
            Error
          {:else if $selectedNotification.type === 'warning'}
            Warning
          {:else if $selectedNotification.type === 'standard'}
            Notification
          {:else if $selectedNotification.type === 'success'}
            Success
          {/if}
        {/if}
      </h3>
      <p class="full-message">{@html $selectedNotification.message}</p>
      {#if !$selectedNotification.hideDismissButton}
        <div>
          <button class="pulse" on:click={() => { if($selectedNotification == $notification){ $notification = null }; $selectedNotification = null; }}>dismiss</button>
        </div>
      {/if}
    </Overlay>
  {/key}
{/if}

<!-- Style -->
<style>
  #notification {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    width: 250px;
    max-width: 100%;
    max-height: 250px;
    border-radius: 0.5rem;
    padding: 0.5rem;
    font-size: small;
    cursor: pointer;
    word-wrap: break-word;
    overflow: hidden;
    box-shadow: 3px 4px 0 var(--shadow-color);
  }

  #notification :global(a) {
    text-decoration-color: currentColor;
  }

  .standard {
    background-color: dodgerblue;
    color: white;
  }

  .error {
    background-color: var(--c4);
    color: white;
  }

  .success {
    background-color: var(--c2);
    color: #444;
  }

  .warning {
    background-color: gold;
    color: #444;
  }

  .full-message {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-y: auto;
    max-height: 60vh;
    padding: 0 1px;
  }
</style>