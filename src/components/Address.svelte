<!-- svelte-ignore a11y-click-events-have-key-events -->

<!-- Module -->
<script type="ts" context="module">
  import { isAddress } from "ethers/lib/utils";
  export const shortAddress = (address: string) => {
    if(!isAddress(address)) throw new Error(`Not a valid address: ${address}`);
    return address.slice(0, 6) + "..." + address.slice(address.length - 4);
  }
</script>

<!-- Component -->
<script type="ts">
  export let address: string
  let showCopyAlert = false;
  let copyAlertTimeout: undefined | NodeJS.Timeout;
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    showCopyAlert = true;
    if(copyAlertTimeout) clearTimeout(copyAlertTimeout);
    copyAlertTimeout = setTimeout(() => {
      showCopyAlert = false;
    }, 2000);
  };
</script>

<!-- Format address preview -->
<button class="address monospace" title="copy" class:alert-copy={showCopyAlert} on:click={copyAddress}>{shortAddress(address)}</button>

<!-- Style -->
<style>
  .address {
    display: inline-block;
    position: relative;
    overflow: hidden;
    cursor: copy;
  }
  .address.alert-copy::after {
    content: "Copied!";
    position: absolute;
    inset: 0;
    color: var(--c2);
    background-color: var(--c0);
    border-radius: inherit;
    opacity: 0.9;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }
</style>