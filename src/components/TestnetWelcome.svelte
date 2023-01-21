<script type="ts">
  import { Config } from "../config";
  import Overlay from "./Overlay.svelte";

  let dismissed = false;

</script>

{#if Config.build.testnet && !dismissed}
  <Overlay width={600} close={() => null}>
    <div id="container">
      <h3>Welcome, Pooler!</h3>
      <p>
        This is the <i>test</i> deployment of <strong>Poolygotchi</strong>, if you're looking for the main deployment, you can find it at <a href="https://poolygotchi.com">poolygotchi.com</a>.
      </p>
      <h4 class="warning"><i class="icofont-warning"/> Warning! <i class="icofont-warning"/></h4>
      <p>
        This dapp is still being tested and may have bugs! Please double check <i>ALL</i> contract interactions you do through this interface! The Poolygotchi contracts in this interface are deployed to the Optimism Goerli testnet, this means that all poolygotchi hatching, goal setting, and personalization are sent to the testnet.
      </p>
      <p class="warning">
        <strong>However</strong>, all interactions you do with the PoolTogether protocol (withdrawals, deposits, prize claims, etc.) are committed to mainnet deployments!
      </p>
      <p>
        Please be careful and have fun!
      </p>
      <button on:click={() => dismissed = true}>Acknowledge <i class="icofont-ui-check" /></button>
    </div>
  </Overlay>
{/if}

<!-- Style -->
<style>
  #container {
    overflow-y: auto;
    max-height: calc(100vh - 5rem);
    padding: 0 0.5rem 0.5rem 0.5rem;
  }

  .warning {
    color: var(--icon-gold);
  }
</style>