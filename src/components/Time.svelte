<script type="ts" context="module">
  import { readable } from "svelte/store";
  export const time = readable(Date.now(), (set) => {
    setInterval(() => {
      set(Date.now());
    }, 500);
  });
</script>