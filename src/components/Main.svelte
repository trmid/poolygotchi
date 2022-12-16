<script type="ts">
  import { fly } from "svelte/transition";
</script>

<main class="margins" in:fly={{ delay: 200, duration: 400, y: -20 }} out:fly={{ duration: 200,  y: 20 }}>
  <slot></slot>
</main>