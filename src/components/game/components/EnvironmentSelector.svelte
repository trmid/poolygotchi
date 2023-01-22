<script type="ts">
  import { BigNumber } from "ethers";
  import { onMount } from "svelte";
  import Poolygotchi from "../../../utils/poolygotchi";
  import Overlay from "../../Overlay.svelte";
  import Carousel from "./Carousel.svelte";

  // Props:
  export let environmentId: BigNumber;
  export let highlightId: BigNumber | undefined = undefined;

  // Variables:
  let numEnvironments: BigNumber = BigNumber.from(3);
  let expandedEnvironment: BigNumber | null = null;
  
  // Carousel Functions:
  export const prev = () => {
    environmentId = BigNumber.from(environmentId).sub(1);
    if(environmentId.lt(0)) environmentId = BigNumber.from(numEnvironments).sub(1);
  };
  export const next = () => {
    environmentId = BigNumber.from(environmentId).add(1);
    if(environmentId.gte(numEnvironments)) environmentId = BigNumber.from(0);
  };

  // On Mount:
  onMount(() => {
    Poolygotchi.contract().numEnvironments().then(num => numEnvironments = num).catch(console.error);
  });
</script>

<!-- Environment Carousel -->
<Carousel {prev} {next}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img class="environment" src="assets/environments/{environmentId}/environment.png" alt="Environment #{environmentId}" class:highlight={highlightId && environmentId.eq(highlightId)} on:click={() => expandedEnvironment = environmentId }>
</Carousel>

<!-- Expanded Environment Viewer -->
{#if expandedEnvironment}
  <Overlay close={() => expandedEnvironment = null} width={600}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <img class="environment-large" src="assets/environments/{environmentId}/environment.png" alt="Environment #{environmentId}" on:click={() => expandedEnvironment = null}>
  </Overlay>
{/if}

<!-- Style -->
<style>
  img.environment {
    display: block;
    width: calc(var(--game-size) * 0.5);
    border-radius: 0.5rem;
    box-sizing: border-box;
  }
  img.environment.highlight {
    border: 2px dashed var(--c3);
  }
  img.environment-large {
    display: block;
    width: 100%;
    border-radius: 0.5rem;
  }
</style>