<script type="ts">
  import { BigNumber, ethers } from "ethers";
  import PoolTogether from "../../../utils/poolTogether";
  import { account } from "../../Account.svelte";
  import { pushNotification } from "../../Notifications.svelte";
  import ButtonControllerSvelte from "./ButtonController.svelte";
  import type { ButtonController } from "./ButtonController.svelte";
  import type { UIComponent, UINumberInput } from "./Menu.svelte";
  import { DeviceButtons, EMPTY_BUTTON } from "./Buttons.svelte";
  import Menu from "./Menu.svelte";

  // Props:
  export let deviceButtonController: ButtonController;
  export let close: () => void;

  // Constants:
  const menuComponents: UIComponent[] = [
    { type: "number", placeholder: "amount", onChange: (v) => amount = ethers.utils.parseUnits(""+v, 6), min: 0 } as UINumberInput,
  ];
  const buttons: DeviceButtons = {
    left: { title: "Cancel", class: "icofont-undo", action: close },
    middle: { title: "Deposit", class: "icofont-coins", action: () => deposit() },
    right: EMPTY_BUTTON
  };

  // Variables:
  let amount: BigNumber;

  // Function to trigger the deposit transaction:
  const deposit = async () => {
    try {
      if(!$account) throw new Error("Not connected!");
      await PoolTogether.deposit(10, amount, $account);
    } catch(err) {
      console.error(err);
      pushNotification({ message: "Failed to deposit.", type: "error" });
    }
  };
</script>

<!-- Button Controller -->
<ButtonControllerSvelte controller={deviceButtonController} {buttons} />

<!-- Menu -->
<Menu components={menuComponents}/>