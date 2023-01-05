<script type="ts" context="module">
  import { writable } from "svelte/store";
  export const focused = writable(true);
</script>

<svelte:window
  on:focus={() => $focused = true}
  on:blur={() => $focused = false}
/>
