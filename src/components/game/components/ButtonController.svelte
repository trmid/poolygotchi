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
        return {
          remove: () => {
            stack = stack.filter(x => x != b);
            _set(stack[stack.length - 1]);
          },
          update: (b2) => {
            let index = stack.indexOf(b);
            if(index < 0) throw new Error("item was removed");
            b = b2;
            stack[index] = b;
            if(index == stack.length - 1) _set(b);
          }
        };
      },
      ...readable<DeviceButtons>(root, set => {
        _set = set;
      })
    };
    return controller;
  }

  export interface ButtonController extends Readable<DeviceButtons> {
    define: (buttons: DeviceButtons) => { remove: () => void, update: (buttons: DeviceButtons) => void }
  }
</script>

<!-- Component -->
<script type="ts">
  import { onDestroy, onMount } from "svelte";
  
  export let controller: ButtonController;
  export let buttons: DeviceButtons;
  
  $: buttons && _update && _update(buttons);

  let _remove: () => void;
  let _update: (b: DeviceButtons) => void;
  onMount(() => {
    const { remove, update } = controller.define(buttons);
    _remove = remove;
    _update = update;
  });
  onDestroy(() => _remove());
</script>