<!-- Module -->
<script type="ts" context="module">
  import { readable, Readable, Subscriber } from "svelte/store";
  import type { DeviceButtons } from "./Buttons.svelte";

  export function buttonController(root: DeviceButtons) {
    let _set: Subscriber<DeviceButtons>;
    let stack: Partial<DeviceButtons>[] = [root];
    const update = () => {
      const b = {...stack[stack.length - 1]};
      for(let i = stack.length - 1; i >= 0; i--) {
        b.left ??= stack[i].left;
        b.middle ??= stack[i].middle;
        b.right ??= stack[i].right;
      }
      _set(b as DeviceButtons);
    };
    const controller: ButtonController = {
      define: b => {
        stack.push(b);
        update();
        return {
          remove: () => {
            stack = stack.filter(x => x != b);
            update();
          },
          update: (b2) => {
            let index = stack.indexOf(b);
            if(index < 0) throw new Error("item was removed");
            b = b2;
            stack[index] = b;
            update();
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
    define: (buttons: Partial<DeviceButtons>) => { remove: () => void, update: (buttons: Partial<DeviceButtons>) => void }
  }
</script>

<!-- Component -->
<script type="ts">
  import { onDestroy, onMount } from "svelte";
  
  export let controller: ButtonController;
  export let buttons: Partial<DeviceButtons>;
  
  $: buttons && _update && _update(buttons);

  let _remove: () => void;
  let _update: (b: Partial<DeviceButtons>) => void;
  onMount(() => {
    const { remove, update } = controller.define(buttons);
    _remove = remove;
    _update = update;
  });
  onDestroy(() => _remove());
</script>