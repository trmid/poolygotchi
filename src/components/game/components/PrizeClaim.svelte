<script type="ts">
  import type { ButtonController } from "./ButtonController.svelte";
  import { poolygotchi } from "../Game.svelte";
  import PoolTogether from "../../../utils/poolTogether";
  import { BigNumber } from "ethers";
  import { formatUSDC } from "../../../utils/token";
  import { account } from "../../Account.svelte";
  import { uiButton, uiChainInput, UIComponent, uiLabel } from "./Menu.svelte";
  import Menu from "./Menu.svelte";
  import { pushNotification } from "../../Notifications.svelte";
  import { explorerReceipt, txNotification } from "../../../utils/tx";
  import { onMount } from "svelte";
  import type { DrawResults } from "@pooltogether/v4-client-js";

  // Props:
  export let unclaimedDraws: Awaited<ReturnType<(typeof PoolTogether)["getUnclaimedDraws"]>> | undefined = undefined;
  export let deviceButtonController: ButtonController;
  export let close: () => void;

  // Variables:
  let chain: number = 10;
  let claiming = false;

  // Reactive Assignments:
  $: anyClaimable = (unclaimedDraws ?? []).filter(x => x.unclaimedDraws.length > 0).length > 0;
  $: chainIds = [...new Set((unclaimedDraws ?? []).filter(x => x.unclaimedDraws.length > 0).map(x => x.chainId))];
  $: claimableAmount = claimable(chain);

  // Edit menu:
  let components: (UIComponent | null)[] = [];
  $: components = (anyClaimable || !unclaimedDraws) ? [
    uiLabel({ label: unclaimedDraws ? "chain" : "loading <i class='icofont-custom-spinner'></i>" }),
    uiLabel({ label: "claimable" }),
    uiButton({ icon: "icofont-undo colored", name: "back", title: "Back", action: close }),
    uiChainInput({ title: "Switch Chain", chain, chainIds, onChange: onChainChange, disabled: claiming }),
    uiLabel({ label: claimableAmount.gt(0) ? `<img src="img/usdc.webp" alt="$" width="16"><span>${formatUSDC(claimableAmount)}</span>` : "no prizes won", style: "display:flex;align-items:center;gap:0.5rem;", disabled: claimableAmount.lte(0) || claiming }),
    uiButton({ icon: "icofont-money colored", name: "claim prizes", title: "Claim Prizes", action: claim, disabled: claimableAmount.lte(0) || claiming }),
  ] : [
    uiLabel({ label: "no prizes won" }),
    uiButton({ icon: "icofont-undo colored", name: "back", title: "Back", action: close }),
  ];

  // Functions:
  const onChainChange = (newChain: number) => {
    if(chain != newChain) chain = newChain;
  };

  const claimable = (chainId: number) => {
    if(!unclaimedDraws) return BigNumber.from(0);
    const draws = unclaimedDraws.filter(x => x.chainId == chainId)[0].unclaimedDraws;
    let amount = BigNumber.from(0);
    for(const draw of draws) {
      amount = amount.add(draw.totalValue);
    }
    return amount;
  };

  const claim = async () => {
    if(!unclaimedDraws) return;
    let dismissPending: (() => void) | undefined;
    try {
      claiming = true;
      if(!$account) throw new Error("Not connected!");
      dismissPending = pushNotification({ message: "Waiting for transaction approval <i class='icofont-custom-spinner'></i>", type: "standard", title: "Claiming Prizes", persist: true });
      await $account.switchChain(chain);
      const unclaimed = unclaimedDraws.filter(x => x.chainId == chain)[0].unclaimedDraws;
      const draws: Record<number, DrawResults> = {};
      for(const draw of unclaimed) {
        draws[draw.drawId] = draw;
      }
      const res = await PoolTogether.claim(chain, draws, $account.signer);
      dismissPending();
      dismissPending = pushNotification({ message: "Waiting for transaction receipt <i class='icofont-custom-spinner'></i>", type: "standard", title: "Claiming Prizes", persist: true });
      const receipt = await res.wait();
      dismissPending();
      pushNotification({ message: `Prizes claimed!\n\n<a href="${explorerReceipt(chain, receipt)}" target="_blank" rel="noreferrer">View Receipt</a>`, type: "success" });
      $poolygotchi = await $account.poolygotchi();
    } catch(err) {
      console.error(err);
      pushNotification(txNotification(err) ?? { message: "Failed to claim prizes.", type: "error" });
    } finally {
      dismissPending && dismissPending();
      claiming = false;
    }
  };

  // On Mount:
  onMount(() => {
    if($account) {
      $account.signer.getChainId().then(id => {
        if(chainIds.includes(id)) chain = id;
      }).catch(console.error);
      if(!unclaimedDraws) {
        PoolTogether.getUnclaimedDraws($account.address).then(draws => unclaimedDraws = draws).catch(console.error);
      }
    }
  });
</script>

<!-- Editing Menu -->
<Menu {deviceButtonController} selectedComponentIndex={3} {components} itemsPerColumn={3} title="Prizes" />
