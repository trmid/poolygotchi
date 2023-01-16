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
  let menuComponents: UIComponent[] = [];
  $: console.log(formatUSDC);
  $: menuComponents = [
    { type: "label", label: "chain" } as UILabel,
    { type: "label", label: "deposited" } as UILabel,
    { type: "label", label: "amount" } as UILabel,
    { type: "button", name: "<i class='icofont-undo' style='color:hsl(0,75%,64%);'></i>cancel", action: close } as UIButton,
    { type: "chain", chain, onChange: c => chainChanged(c) } as UIChainInput,
    { type: "label", label: deposited === undefined ? "loading..." : formatUSDC(deposited), token: 'usdc', style: 'text-align:right;' } as UILabel,
    { type: "number", placeholder: "amount", token: 'usdc', attributes: { min: 0, max: parseFloat(formatUSDC(balance ?? BigNumber.from(0), false)), step: 5 }, onChange: v => amountChanged(v), style: 'text-align:right;' } as UINumberInput,
    {
      type: "button",
      name: isApproved ? "<i class='icofont-coins' style='color:hsl(50,75%,64%);'></i> deposit" : "<i class='icofont-ui-check' style='color:hsl(190,75%,64%);'></i> approve",
      action: isApproved ? (() => deposit()) : (() => approve())
    } as UIButton
  ];

  // Buttons:
  let buttons: DeviceButtons;
  $: buttons = {
    left: { title: "cancel", class: "icofont-undo", action: close },
    middle: isApproved ? { title: "deposit", class: "icofont-coins", action: () => deposit() } : { title: "approve", class: "icofont-ui-check", action: () => approve() },
    right: EMPTY_BUTTON
  };

  // Handle amount value change:
  const amountChanged = (value: number) => {
    const newAmount = ethers.utils.parseUnits(""+value, 6);
    if(!newAmount.eq(amount)) {
      amount = newAmount;
    }
  };

  // Handle chain change:
  const chainChanged = (value: number) => {
    if(chain != value) chain = value;
  };

  // Function to query balance and approvals for a given chain:
  const queryBalance = async (chain: number) => {
    if(!$account) return;
    const prizePool = PoolTogether.prizePool(chain);
    balance = await prizePool.getUsersTokenBalance($account.address);
    deposited = (await prizePool.getUsersPrizePoolBalances($account.address)).ticket;
    approved = (await prizePool.getUsersDepositAllowance($account.address)).allowanceUnformatted;
  };

  // Function to trigger the approval transaction:
  const approve = async () => {
    try {
      if(!$account) throw new Error("Not connected!");
      await PoolTogether.approve(chain, amount, $account);
      await queryBalance(chain);
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Failed to approve.", type: "error" });
    }
  };

  // Function to trigger the deposit transaction:
  const deposit = async () => {
    try {
      if(!$account) throw new Error("Not connected!");
      await PoolTogether.deposit(chain, amount, $account);
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Failed to deposit.", type: "error" });
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