<script type="ts">
  import { fade } from "svelte/transition";
  import ButtonControllerSvelte from "./ButtonController.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import { DeviceButtons, EMPTY_BUTTON } from "./Buttons.svelte";
  import { poolygotchi } from "../Game.svelte";
  import PoolTogether from "../../../utils/poolTogether";
  import type { PoolygotchiHatchery } from "../../../solidity/typechain-types";
  import GoalMeter from "./GoalMeter.svelte";
  import { BigNumber, ethers } from "ethers";
  import { formatUSDC } from "../../../utils/token";
  import { account } from "../../Account.svelte";
  import { uiButton, UIComponent, uiLabel, uiNumberInput } from "./Menu.svelte";
  import Menu from "./Menu.svelte";
  import { pushNotification } from "../../Notifications.svelte";
  import { Config } from "../../../config";
  import Poolygotchi from "../../../utils/poolygotchi";
  import { explorerReceipt, txNotification } from "../../../utils/tx";

  // Props:
  export let deviceButtonController: ButtonController;
  export let close: () => void;

  // Variables:
  let data: PoolygotchiHatchery.PoolygotchiStructOutput | undefined;
  let healthFactor: number = -5;
  let editing = false;
  let newWeeklyGoal: BigNumber = BigNumber.from(0);
  let settingGoal = false;

  // Reactive data updates:
  $: $poolygotchi && updateData($poolygotchi).catch(console.error);
  const updateData = async (poolygotchi: Poolygotchi) => {
    data = await poolygotchi.data();
    newWeeklyGoal = BigNumber.from(data.goalAmountWeekly);
    healthFactor = await poolygotchi.healthFactor();
    editing = false;
  };

  // Device Buttons:
  let buttons: DeviceButtons;
  $: buttons = {
    left: { title: "Back", class: "icofont-undo", action: close },
    middle: EMPTY_BUTTON,
    right: { title: "Edit", class: "icofont-edit", action: () => editing = true }
  };

  // Edit menu:
  let editComponents: (UIComponent | null)[] = [];
  $: editComponents = [
    uiLabel({ label: "weekly goal" }),
    uiButton({ icon: "icofont-undo colored", name: "back", title: "Back", action: () => editing = false }),
    uiNumberInput({ title: "Edit Amount", token: 'usdc', attributes: { min: 0 }, initialValue: parseFloat(formatUSDC(newWeeklyGoal ?? BigNumber.from(0), false)), onChange: onGoalChange, disabled: settingGoal }),
    uiButton({ icon: "icofont-save colored", name: "set goal", title: "Set New Goal", action: setGoal, disabled: settingGoal }),
  ];

  // Functions:
  const onGoalChange = (goal: number) => {
    try {
      const bigGoal = ethers.utils.parseUnits(""+goal.toFixed(6), 6);
      const decimals = goal.toString().split('.').slice(-1)[0];
      if(!newWeeklyGoal.eq(bigGoal) || (decimals && decimals[0].length > 6)) {
        newWeeklyGoal = bigGoal;
      }
    } catch(err) {
      console.error(err);
      newWeeklyGoal = data?.goalAmountWeekly ?? BigNumber.from(0);
    }
  };

  const setGoal = async () => {
    let dismissPending: (() => void) | undefined;
    try {
      settingGoal = true;
      if(!$account) throw new Error("Not connected!");
      dismissPending = pushNotification({ message: "Waiting for transaction approval <i class='icofont-custom-spinner'></i>", type: "standard", title: "Setting New Goal", persist: true });
      const chainId = Config.networks.poolygotchi.chainId;
      await $account.switchChain(chainId);
      const deposited = await PoolTogether.totalDeposited($account.address);
      const res = await Poolygotchi.contract().connect($account.signer).setGoal(newWeeklyGoal, deposited);
      dismissPending();
      dismissPending = pushNotification({ message: "Waiting for transaction receipt <i class='icofont-custom-spinner'></i>", type: "standard", title: "Setting New Goal", persist: true });
      const receipt = await res.wait(Config.confirmations);
      dismissPending();
      pushNotification({ message: `New goal set!\n\n<a href="${explorerReceipt(chainId, receipt)}" target="_blank" rel="noreferrer">View Receipt</a>`, type: "success" });
      $poolygotchi = await $account.poolygotchi();
    } catch(err) {
      console.error(err);
      pushNotification(txNotification(err) ?? { message: "Failed to set new goal.", type: "error" });
    } finally {
      dismissPending && dismissPending();
      settingGoal = false;
    }
  };

</script>

<!-- Device Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

{#if editing}

  <!-- Editing Menu -->
  <Menu {deviceButtonController} selectedComponentIndex={2} components={editComponents} itemsPerColumn={2} close={() => editing = false} title="New Goal" />

{:else}

  <!-- Container -->
  <div id="container" transition:fade={{ duration: 250 }}>

    <!-- Goal Meter -->
    <GoalMeter {healthFactor} />

    <!-- Stats -->
    <div id="stats">
      <div class="stat">
        <strong>Deposited:</strong>
        <span>
          {#if $account}
            {#await PoolTogether.totalDeposited($account.address)}
              <i class="icofont-custom-spinner" />
              loading
            {:then deposited} 
              <img class="usdc" src="img/usdc.webp" alt="$">
              {formatUSDC(deposited)}
            {/await}
          {/if}
        </span>
      </div>
      <div class="stat">
        <strong>Goal:</strong>
        <span>
          <img class="usdc" src="img/usdc.webp" alt="$">
          {formatUSDC(data?.goalAmountWeekly ?? BigNumber.from(0))} / week
        </span>
      </div>
      <div class="stat">
        <strong>Health Factor:</strong>
        <span>{healthFactor.toFixed(2)}</span>
      </div>
    </div>

    <!-- Buttons -->
    <div id="buttons">

      <!-- Back Button -->
      <button class="game-ui" on:click={close}>
        <i class="icofont-undo colored" />
        back
      </button>

      <!-- Edit Button -->
      <button class="game-ui" on:click={() => editing = true}>
        <i class="icofont-edit colored" style:margin-right="5px" />
        new goal
      </button>

    </div>

  </div>
      
{/if}

<!-- Style -->
<style>
  #container {
    background-color: #0006;
    position: absolute;
    inset: 0;
    padding: 6%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  #stats {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  div.stat {
    padding: 0.5rem;
    border-radius: 0.5rem;
    background: linear-gradient(165deg, #bbba -50%, var(--c0) 110%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    font-size: small;
    width: 250px;
    max-width: 100%;
    box-sizing: border-box;
    line-height: 1.5;
  }

  div.stat > span {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  #buttons {
    display: flex;
    justify-content: space-between;
  }

  img.usdc {
    width: 16px;
    position: relative;
    top: -1px;
  }
</style>