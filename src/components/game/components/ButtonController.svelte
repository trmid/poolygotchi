<!-- Module -->
<script type="ts" context="module">
  import { readable, Readable, Subscriber } from "svelte/store";
  import type { DeviceButtons } from "./Buttons.svelte";

  export function buttonController(root: DeviceButtons) {
    let _set: Subscriber<DeviceButtons>;
    let stack: DeviceButtons[] = [root];
    const controller: ButtonController = {
      define: b => {
        stack.push(b);
        _set(b);
        return () => {
          stack = stack.filter(x => x != b);
          _set(stack[stack.length - 1]);
        };
      },
      ...readable<DeviceButtons>(root, set => {
        _set = set;
      })
    };
    return controller;
  }

  export interface ButtonController extends Readable<DeviceButtons> {
    define: (buttons: DeviceButtons) => () => void
  }
</script>

<!-- Component -->
<script type="ts">
  import { onDestroy, onMount } from "svelte";
  
  export let controller: ButtonController;
  export let buttons: DeviceButtons;

  let remove: () => void;
  onMount(() => remove = controller.define(buttons));
  onDestroy(() => remove());
</script>