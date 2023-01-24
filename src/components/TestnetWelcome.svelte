<script type="ts">
  import { Config } from "../config";
  import { pushNotification } from "./Notifications.svelte";
  import Overlay from "./Overlay.svelte";

  let dismissed = false;
  let checkedMainnet = !!localStorage.getItem("test:checkedMainnet");
  let highlightCheckbox = false;

  const dismiss = () => {
    if(checkedMainnet) {
      dismissed = true;
      localStorage.setItem("test:checkedMainnet", "true");
    } else {
      highlightCheckbox = true;
      pushNotification({ message: "Please read through the entire message and complete the form before continuing.", title: "Missing Field", type: "warning", popup: true });
    }
  }

</script>

{#if Config.build.testnet && !dismissed}
  <Overlay width={600} close={() => null}>
    <div id="container">
      <h3>Welcome, Pooler!</h3>
      <p>
        This is the <i>test</i> deployment of <strong>Poolygotchi</strong>.
      </p>
      <h4 class="warning"><i class="icofont-warning"/> Warning! <i class="icofont-warning"/></h4>
      <p>
        This dapp is still being tested and may have bugs! Please double check <i>ALL</i> contract interactions you do through this interface! The Poolygotchi contracts in this interface are deployed to the Optimism Goerli testnet, this means that all poolygotchi hatching, goal setting, and personalization are sent to the testnet.
      </p>
      <p class="warning">
        <strong>However</strong>, all interactions you do with the PoolTogether protocol (withdrawals, deposits, prize claims, etc.) are committed to <u>mainnet deployments</u>!
      </p>
      <div class="checkbox-container">
        <button class="checkbox" class:highlight={highlightCheckbox} class:checked={checkedMainnet} on:click={() => checkedMainnet = !checkedMainnet}>
          <i class="icofont-verification-check" />
        </button>
        <i class="warning">I have read and understand the previous statement.</i>
      </div>
      <br>
      <p>
        Please be careful and have fun!
      </p>
      <button class="pulse" on:click={dismiss}>Acknowledge <i class="icofont-ui-check" /></button>
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

  .checkbox-container {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
  }

  .checkbox {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 3px solid #0004;
    background-color: var(--c3);
    color: var(--c1);
    padding: 0;
    font-size: 16px;
  }

  .checkbox:hover {
    border: 3px solid #0008;
  }

  .checkbox.highlight:not(.checked) {
    border: 3px dashed var(--c4);
  }

  .checkbox > i {
    display: none;
  }

  .checkbox.checked > i {
    display: block;
  }

  .checkbox-container > i {
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: #fff2;
  }

  .warning {
    color: var(--icon-gold);
  }
</style>