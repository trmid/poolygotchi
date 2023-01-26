<script type="ts">
  import { onDestroy } from "svelte";

  let container: HTMLElement | undefined;
  let hover = false;

  const pointerenter = (e: PointerEvent) => {
    if(container) {
      const c = container;
      const observer = new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          if (mutation.type === 'childList') {
            console.log(mutation);
            if(mutation.addedNodes[0] == c) {
              observer.disconnect();
              const bb = c.getBoundingClientRect();
              console.log(bb);
              const origin = { x: e.clientX - e.offsetX, y: e.clientY - e.offsetY };
              console.log(origin);
              const padding = 7;
              let top = origin.y - padding;
              let left = origin.x - padding;
              let right: number | null = null;
              if(bb.width > window.innerWidth - 2 * padding) {
                left = padding;
                right = padding;
              } else {
                const rightOverhang = left + bb.width + padding - window.innerWidth;
                if(rightOverhang > 0) left -= rightOverhang;
                else if (left < padding) left += padding - left;
              }
              c.style.display = "block";
              c.style.top = `${top}px`;
              c.style.left = `${left}px`;
              if(right !== null) c.style.right = `${right}px`;
            }
          }
        }
      });
      observer.observe(document.body, { childList: true });
      c.style.display = "block";
      document.body.append(c);
      hover = true;
    }
  };

  const hide = () => {
    container?.remove();
    container?.removeAttribute("style");
    hover = false;
  };

  onDestroy(() => {
    hide();
  });
</script>

<!-- Alternate way to hide tooltip -->
<svelte:window on:pointerdown={hide} />

<!-- Tooltip -->
<span class="tooltip" class:hover on:pointerenter={pointerenter} on:pointerdown|stopPropagation>
  <i class="icofont-question-circle" />
  <slot name="label" />
</span>

<!-- Body -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="body-container" on:pointerdown|stopPropagation on:click|stopPropagation on:pointerleave={hide} bind:this={container}>
  <div class="body">
    <slot></slot>
  </div>
</div>

<!-- Style -->
<style>
  .tooltip {
    opacity: 0.7;
  }

  .tooltip:hover, .tooltip.hover {
    opacity: 1;
  }

  .body-container {
    position: fixed;
    display: none;
    z-index: 200;
    max-width: 300px;
    padding-top: 30px;
  }

  .body {
    padding: 7px;
    font-size: small;
    border: 1px solid #fff4;
    border-radius: 0.5rem;
    background-color: var(--c0);
    box-shadow: 2px 2px 5px var(--shadow-color);
  }
</style>