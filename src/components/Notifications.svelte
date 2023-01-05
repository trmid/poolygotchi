<!-- Module -->
<script type="ts" context="module">
  import { writable } from "svelte/store";
  export interface Notification {
    message: string
    type: 'error' | 'warning' | 'standard' | 'success'
    timestamp: number
  }
  export const notification = writable<Notification | null>(null);
  export function pushNotification(_notification: Omit<Notification, "timestamp">) {
    (_notification as Notification).timestamp = Date.now();
    notification.set((_notification as Notification));
  }
</script>

<!-- Component -->
<script type="ts">
  import Overlay from "./Overlay.svelte";
  import { time } from "./Time.svelte";
  import { fly, fade } from "svelte/transition";

  const notificationDuration = 9000;
  let selectedNotification: Notification | null = null;
</script>

<!-- Notifications -->
{#if $notification && $time - $notification.timestamp < notificationDuration}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    id="notification"
    class={$notification.type}
    on:click={() => selectedNotification = $notification}
    in:fly={{ y: 250 }}
    out:fade={{ duration: 1000 }}
  >
    {@html $notification.message}
  </div>
{/if}

<!-- Selected Notification -->
{#if selectedNotification}
  <Overlay close={() => selectedNotification = null}>
    <h3 class={selectedNotification.type}>
      {#if selectedNotification.type === 'error'}
        Error
      {:else if selectedNotification.type === 'warning'}
        Warning
      {:else if selectedNotification.type === 'standard'}
        Notification
      {:else if selectedNotification.type === 'success'}
        Success
      {/if}
    </h3>
    <p class="full-message">{@html selectedNotification.message}</p>
  </Overlay>
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
    background-color: dodgerblue;
    color: white;
    font-size: small;
    cursor: pointer
  }

  #notification.error {
    background-color: var(--c4);
  }

  #notification.success {
    background-color: var(--c2);
    color: #444;
  }

  #notification.warning {
    background-color: #666;
    color: gold;
  }

  .full-message {
    white-space: pre-wrap;
  }
</style>