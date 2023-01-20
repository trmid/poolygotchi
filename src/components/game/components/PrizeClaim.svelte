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
  import { onDestroy, onMount } from "svelte";
  import type { DrawResults } from "@pooltogether/v4-client-js";
  import { Config } from "../../../config";

  // Props:
  export let unclaimedDraws: Awaited<ReturnType<(typeof PoolTogether)["getUnclaimedDraws"]>> | undefined = undefined;
  export let deviceButtonController: ButtonController;
  export let close: () => void;

  // Variables:
  let chain: number = 10;
  let claiming = false;
  let searchingChain: number = 0;
  let searchStartTimeout: NodeJS.Timeout;
  let stopPrizeSearch: (() => void) | null = null;

  // Reactive Assignments:
  // $: anyClaimable = (unclaimedDraws ?? []).filter(x => x.unclaimedDraws.length > 0).length > 0;
  $: claimableAmount = claimable(chain, unclaimedDraws);
  $: unclaimedDraws, chain, searchPrizeHistory();

  // Edit menu:
  let components: (UIComponent | null)[] = [];
  $: components = [
    uiLabel({ label: unclaimedDraws ? "chain" : "loading <i class='icofont-custom-spinner'></i>" }),
    uiLabel({ label: `claimable${stopPrizeSearch ? " <i class='icofont-custom-spinner' title='Searching for Prizes'></i>" : ""}` }),
    uiButton({ icon: "icofont-undo colored", name: "back", title: "Back", action: close }),
    uiChainInput({ title: "Switch Chain", chain, onChange: onChainChange, disabled: claiming }),
    uiLabel({ label: claimableAmount.gt(0) ? `<img src="img/usdc.webp" alt="$" width="16"><span>${formatUSDC(claimableAmount)}</span>` : "no prizes won", style: "display:flex;align-items:center;gap:0.5rem;", disabled: claimableAmount.lte(0) || claiming }),
    uiButton({ icon: "icofont-money colored", name: "claim prizes", title: "Claim Prizes", action: claim, disabled: claimableAmount.lte(0) || claiming }),
  ];

  // Functions:
  const onChainChange = (newChain: number) => {
    if(chain != newChain) chain = newChain;
  };

  const claimable = (chainId: number, draws: typeof unclaimedDraws) => {
    if(!draws) return BigNumber.from(0);
    const chainDraws = draws.filter(x => x.chainId == chainId)[0].unclaimedDraws;
    let amount = BigNumber.from(0);
    for(const draw of chainDraws) {
      amount = amount.add(draw.totalValue);
    }
    return amount;
  };

  const searchPrizeHistory = () => {
    if(!$account || searchingChain == chain) return;
    const address = $account.address;
    if(searchStartTimeout) clearTimeout(searchStartTimeout);
    searchStartTimeout = setTimeout(() => {
      PoolTogether.searchForUnclaimedDraws(chain, address, (unclaimedDraw, done) => {
        if(unclaimedDraws && unclaimedDraw) {
          const draws = unclaimedDraws.filter(x => x.chainId == chain)[0].unclaimedDraws;
          if(draws.filter(x => x.drawId == unclaimedDraw.drawId).length == 0) {
            draws.push(unclaimedDraw);
            unclaimedDraws = unclaimedDraws; // trigger reactive update
          }
        }
        if(done) {
          stopPrizeSearch && stopPrizeSearch();
          stopPrizeSearch = null;
        }
      }).then((stop) => {
        if(stopPrizeSearch) stopPrizeSearch();
        stopPrizeSearch = stop;
      }).catch(console.error);
    }, 1000);
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
      const receipt = await res.wait(Config.confirmations);
      dismissPending();
      pushNotification({ message: `Prizes claimed!\n\n<a href="${explorerReceipt(chain, receipt)}" target="_blank" rel="noreferrer">View Receipt</a>`, type: "success" });

      // Removed claims from draws:
      unclaimedDraws = unclaimedDraws.filter(x => x.chainId == chain);

      // Trigger poolygotchi refresh:
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
        if([1,10,137,43114].includes(id)) chain = id;
      }).catch(console.error);
      if(!unclaimedDraws) {
        PoolTogether.getUnclaimedDraws($account.address).then(draws => unclaimedDraws = draws).catch(console.error);
      }
    }
  });

  // On Destroy:
  onDestroy(() => {
    if(stopPrizeSearch) stopPrizeSearch();
  });
</script>

<!-- Editing Menu -->
<Menu {deviceButtonController} selectedComponentIndex={3} {components} itemsPerColumn={3} title="Prizes" />
