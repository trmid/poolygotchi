<script type="ts">
  import { BigNumber, ethers } from "ethers";
  import PoolTogether from "../../../utils/poolTogether";
  import { account } from "../../Account.svelte";
  import { pushNotification } from "../../Notifications.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import type { UIButton, UIChainInput, UIComponent, UILabel, UINumberInput } from "./Menu.svelte";
  import Menu from "./Menu.svelte";
  import { onMount } from "svelte";
  import { formatUSDC } from "../../../utils/token";
  import { explorerReceipt, txNotification } from "../../../utils/tx";
  import { Config } from "../../../config";
  import { poolygotchi } from "../Game.svelte";

  // Props:
  export let deviceButtonController: ButtonController;
  export let close: () => void;

  // Variables:
  let chain: number = 10;
  let deposited: BigNumber | undefined;
  let amount: BigNumber = BigNumber.from(0);

  // Reactive statements:
  $: queryBalance(chain).catch(err => {
    console.error(err);
    pushNotification({ message: "Failed to fetch balance.", type: "warning" });
  });

  // Menu Components:
  let menuComponents: (UIComponent | null)[] = [];
  $: menuComponents = [

    /* Chain Label */
    { type: "label", label: "chain" } as UILabel,

    /* Amount Label */
    { type: "label", label: "amount" } as UILabel,

    /* Empty */
    null,

    /* Back Button */
    { type: "button", icon: "icofont-undo colored", name: "back", title: "Back", action: close } as UIButton,

    /* Chain Selector */
    {
      type: "chain",
      title: "Switch Chains",
      chain,
      onChange: c => chainChanged(c),
      disabled: withdrawing,
    } as UIChainInput,

    /* Amount Input */
    {
      type: "number",
      placeholder: "amount",
      title: "Edit Amount",
      token: 'usdc',
      initialValue: parseFloat(formatUSDC(amount ?? BigNumber.from(0), false)),
      attributes: { min: 0, max: parseFloat(formatUSDC(deposited ?? BigNumber.from(0), false)), step: 5 },
      onChange: v => amountChanged(v),
      disabled: withdrawing,
    } as UINumberInput,

    /* Max Button */
    {
      type: "button",
      title: "Set to Max",
      name: (deposited === undefined) ?
        "loading <i class='icofont-custom-spinner'></i>" :
        `$${formatUSDC(deposited)} (max)`,
      token: 'usdc',
      style: 'color:#999;',
      disabled: withdrawing,
      action: () => deposited && amountChanged(deposited)
    } as UIButton,

    /* Withdraw Button */
    {
      type: "button",
      icon: withdrawing ? "icofont-custom-spinner" : "icofont-exit colored",
      title: "Withdraw",
      name: "withdraw",
      disabled: withdrawing,
      action: withdraw
    } as UIButton
  ];

  // Handle amount value change:
  const amountChanged = (value: number | BigNumber) => {
    const newAmount = (typeof value === "number") ? ethers.utils.parseUnits(""+value, 6) : BigNumber.from(value);
    if(!newAmount.eq(amount)) {
      amount = newAmount;
      if(deposited && amount.gt(deposited)) amount = deposited;
    }
  };

  // Handle chain change:
  const chainChanged = (value: number) => {
    if(chain != value) chain = value;
  };

  // Function to query deposited balance for a given chain:
  const queryBalance = async (chain: number) => {
    if(!$account) return;
    deposited = undefined;
    const prizePool = PoolTogether.prizePool(chain);
    const balances = await prizePool.getUsersPrizePoolBalances($account.address);
    deposited = balances.ticket;
    amountChanged(0);
  };

  // Function to trigger the withdraw transaction:
  let withdrawing = false;
  const withdraw = async () => {
    let dismissPending: (() => void) | undefined;
    try {
      withdrawing = true;
      if(!$account) throw new Error("Not connected!");
      if(amount.eq(0)) return pushNotification({ message: "Please input a withdraw amount greater than zero.", type: "warning" });
      dismissPending = pushNotification({ message: "Withdrawing USDC <i class='icofont-custom-spinner'></i>", type: "standard", title: "Withdrawing USDC", persist: true });
      const res = await PoolTogether.withdraw(chain, amount, $account);
      dismissPending();
      dismissPending = pushNotification({ message: "Waiting for transaction receipt <i class='icofont-custom-spinner'></i>", type: "standard", title: "Withdrawing USDC", persist: true });
      const receipt = await res.wait(Config.confirmations);
      dismissPending();
      pushNotification({ message: `Withdrew ${formatUSDC(amount)} USDC.\n\n<a href="${explorerReceipt(chain, receipt)}" target="_blank" rel="noreferrer">View Receipt</a>`, type: "success", title: "Withdrawal Successful" });
      await queryBalance(chain);

      // Trigger poolygotchi refresh:
      $poolygotchi = await $account.poolygotchi();
    } catch(err) {
      console.error(err);
      pushNotification(txNotification(err) ?? { message: "Failed to withdraw.", type: "error" });
    } finally {
      dismissPending && dismissPending();
      withdrawing = false;
    }
  };

  // On Mount:
  onMount(() => {
    $account?.signer.getChainId().then(id => {
      if([1,10,137,43114].includes(id)) chain = id;
    }).catch(console.error);
  });
</script>

<!-- Menu -->
<Menu components={menuComponents} title="withdraw" selectedComponentIndex={4} {deviceButtonController} {close} />