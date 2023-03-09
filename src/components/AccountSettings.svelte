<script lang="ts">
  import { Config } from "../config";
  import { RpcUrl } from "../utils/storage";
  import Overlay from "./Overlay.svelte";

  export let close: () => void;

  let chains = [1,10,137,43114];
  let rpcs = chains.map(chainId => RpcUrl.get(chainId) || "");

</script>

<Overlay {close}>
  <h3>Settings</h3>
  <strong>Custom RPC URLs</strong>
  {#each chains as chain, i}
    <div class="rpc">
      <span>{Config.networks[chain].name}</span>
      <input type="text" bind:value={rpcs[i]} placeholder="https://..." on:change={() => {RpcUrl.set(chain, rpcs[i])}}>
    </div>
  {/each}
</Overlay>

<style>
  .rpc {
    margin: 0.5rem;
    padding: 0.5rem 1rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }

  .rpc > input {
    flex-grow: 1;
    max-width: 400px;
    text-align: left;
  }
</style>