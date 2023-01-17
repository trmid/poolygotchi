<script type="ts">
  import { BigNumber, ethers } from "ethers";
  import PoolTogether from "../../../utils/poolTogether";
  import { account } from "../../Account.svelte";
  import { pushNotification } from "../../Notifications.svelte";
  import ButtonControllerSvelte from "./ButtonController.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import type { UIButton, UIChainInput, UIComponent, UILabel, UINumberInput } from "./Menu.svelte";
  import { DeviceButtons, EMPTY_BUTTON } from "./Buttons.svelte";
  import Menu from "./Menu.svelte";
  import { onMount } from "svelte";
  import { formatUSDC } from "../../../utils/token";
  import { explorerReceipt } from "../../../utils/tx";

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
    { type: "button", name: "<i class='icofont-undo' style='color:hsl(0,75%,64%);'></i> back", action: close } as UIButton,

    /* Chain Selector */
    {
      type: "chain",
      chain,
      onChange: c => chainChanged(c),
      disabled: withdrawing,
    } as UIChainInput,

    /* Amount Input */
    {
      type: "number",
      placeholder: "amount",
      token: 'usdc',
      initialValue: parseFloat(formatUSDC(amount ?? BigNumber.from(0), false)),
      attributes: { min: 0, max: parseFloat(formatUSDC(deposited ?? BigNumber.from(0), false)), step: 5 },
      onChange: v => amountChanged(v),
      style: 'text-align:right;',
      disabled: withdrawing,
    } as UINumberInput,

    /* Max Button */
    {
      type: "button",
      name: (deposited === undefined) ? "loading <i class='icofont-custom-spinner'></i>" : `$${formatUSDC(deposited)} (max)`, token: 'usdc', style: 'justify-content:right;color:#999;',
      disabled: withdrawing,
      action: () => deposited && amountChanged(deposited)
    } as UIButton,

    /* Withdraw Button */
    {
      type: "button",
      name: `${withdrawing ? "<i class='icofont-custom-spinner'></i>" : "<i class='icofont-exit' style='color:hsl(10,75%,64%);'></i>"} withdraw`,
      disabled: withdrawing,
      action: withdraw
    } as UIButton
  ];

  // Device Buttons:
  let buttons: DeviceButtons;
  $: buttons = {
    left: { title: "back", class: "icofont-undo", action: close },
    middle: withdrawing ? EMPTY_BUTTON : { title: "withdraw", class: "icofont-exit", action: () => withdraw() },
    right: EMPTY_BUTTON
  };

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
      const receipt = await res.wait();
      dismissPending();
      pushNotification({ message: `Withdrew ${formatUSDC(amount)} USDC.\n\n<a href="${explorerReceipt(chain, receipt)}" target="_blank" rel="noreferrer">View Receipt</a>`, type: "success", title: "Withdrawal Successful" });
      await queryBalance(chain);
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Failed to withdraw.", type: "error" });
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

<!-- Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Menu -->
<Menu components={menuComponents} title="withdraw" />