<!-- Module -->
<script type="ts" context="module">
  import { writable } from "svelte/store";
  import type Account from "../utils/account";
  export const account = writable<Account | null>(null);
</script>

<!-- Component -->
<script type="ts">
  
</script>