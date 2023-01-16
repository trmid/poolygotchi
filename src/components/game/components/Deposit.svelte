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
  let balance: BigNumber | undefined;
  let approved: BigNumber | undefined;
  let amount: BigNumber = BigNumber.from(0);

  // Reactive statements:
  $: isApproved = approved && approved.gte(amount);
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
      disabled: depositing || approving,
    } as UIChainInput,

    /* Amount Input */
    {
      type: "number",
      placeholder: "amount",
      token: 'usdc',
      initialValue: parseFloat(formatUSDC(amount ?? BigNumber.from(0), false)),
      attributes: { min: 0, max: parseFloat(formatUSDC(balance ?? BigNumber.from(0), false)), step: 5 },
      onChange: v => amountChanged(v),
      style: 'text-align:right;',
      disabled: depositing || approving,
    } as UINumberInput,

    /* Max Button */
    {
      type: "button",
      name: (balance === undefined) ? "loading <i class='icofont-custom-spinner'></i>" : `$${formatUSDC(balance)} (max)`, token: 'usdc', style: 'justify-content:right;color:#888;',
      disabled: depositing || approving,
      action: () => balance && amountChanged(balance)
    } as UIButton,

    /* Approve / Deposit Button */
    (
      isApproved ?
      {
        type: "button",
        name: `${depositing ? "<i class='icofont-custom-spinner'></i>" : "<i class='icofont-coins' style='color:hsl(50,75%,64%);'></i>"} deposit`,
        disabled: depositing,
        action: deposit
      } as UIButton :
      {
        type: "button",
        name: `${approving ? "<i class='icofont-custom-spinner'></i>" : "<i class='icofont-ui-check' style='color:hsl(190,75%,64%);'></i>"} approve`,
        disabled: approving,
        action: approve
      } as UIButton
    )
  ];

  // Device Buttons:
  let buttons: DeviceButtons;
  $: buttons = {
    left: { title: "back", class: "icofont-undo", action: close },
    middle: isApproved ? 
      (depositing ? EMPTY_BUTTON : { title: "deposit", class: "icofont-coins", action: () => deposit() }) :
      (approving ? EMPTY_BUTTON : { title: "approve", class: "icofont-ui-check", action: () => approve() }),
    right: EMPTY_BUTTON
  };

  // Handle amount value change:
  const amountChanged = (value: number | BigNumber) => {
    const newAmount = (typeof value === "number") ? ethers.utils.parseUnits(""+value, 6) : BigNumber.from(value);
    if(!newAmount.eq(amount)) {
      amount = newAmount;
      if(balance && amount.gt(balance)) amount = balance;
    }
  };

  // Handle chain change:
  const chainChanged = (value: number) => {
    if(chain != value) chain = value;
  };

  // Function to query balance and approvals for a given chain:
  const queryBalance = async (chain: number) => {
    if(!$account) return;
    balance = undefined;
    deposited = undefined;
    approved = undefined;
    const prizePool = PoolTogether.prizePool(chain);
    const balances = await prizePool.getUsersPrizePoolBalances($account.address);
    balance = balances.token;
    deposited = balances.ticket;
    approved = (await prizePool.getUsersDepositAllowance($account.address)).allowanceUnformatted;
  };

  // Function to trigger the approval transaction:
  let approving = false;
  const approve = async () => {
    let dismissPending: (() => void) | undefined;
    try {
      approving = true;
      if(!$account) throw new Error("Not connected!");
      dismissPending = pushNotification({ message: "Approving USDC (step 1 of 2) <i class='icofont-custom-spinner'></i>", type: "standard", title: "Approving USDC", persist: true });
      const res = await PoolTogether.approve(chain, amount, $account);
      dismissPending();
      dismissPending = pushNotification({ message: "Waiting for transaction receipt <i class='icofont-custom-spinner'></i>", type: "standard", title: "Approving USDC", persist: true });
      if(res) {
        const receipt = await res.wait();
        pushNotification({ message: `USDC approved. You can now deposit into your PoolTogether balance.\n\n<a href="${explorerReceipt(chain, receipt)}" target="_blank" rel="noreferrer">View Receipt</a>`, type: "standard", title: "USDC Approved" });
      } else {
        pushNotification({ message: "USDC already approved. You may continue with your deposit.", type: "standard", title: "USDC Approved" });
      }
      dismissPending();
      await queryBalance(chain);
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Approval failed.", type: "error" });
    } finally {
      dismissPending && dismissPending();
      approving = false;
    }
  };

  // Function to trigger the deposit transaction:
  let depositing = false;
  const deposit = async () => {
    let dismissPending: (() => void) | undefined;
    try {
      depositing = true;
      if(!$account) throw new Error("Not connected!");
      if(amount.eq(0)) return pushNotification({ message: "Please input a deposit amount greater than zero.", type: "warning" });
      dismissPending = pushNotification({ message: "Depositing USDC (step 2 of 2) <i class='icofont-custom-spinner'></i>", type: "standard", title: "Depositing USDC", persist: true });
      const res = await PoolTogether.deposit(chain, amount, $account);
      dismissPending();
      dismissPending = pushNotification({ message: "Waiting for transaction receipt <i class='icofont-custom-spinner'></i>", type: "standard", title: "Depositing USDC", persist: true });
      const receipt = await res.wait();
      dismissPending();
      pushNotification({ message: `Deposited ${formatUSDC(amount)} USDC.\n\n<a href="${explorerReceipt(chain, receipt)}" target="_blank" rel="noreferrer">View Receipt</a>`, type: "success", title: "USDC Deposited!" });
      await queryBalance(chain);
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Failed to deposit.", type: "error" });
    } finally {
      dismissPending && dismissPending();
      depositing = false;
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
<Menu components={menuComponents} title="deposit" />