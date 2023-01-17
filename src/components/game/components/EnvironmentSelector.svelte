<script type="ts">
  import { BigNumber } from "ethers";
  import { onMount } from "svelte";
  import Poolygotchi from "../../../utils/poolygotchi";
  import Carousel from "./Carousel.svelte";

  // Props:
  export let environmentId: BigNumber;
  export let highlightId: BigNumber | undefined = undefined;

  // Variables:
  let numEnvironments: BigNumber = BigNumber.from(3);
  
  // Carousel Functions:
  const prev = () => {
    environmentId = BigNumber.from(environmentId).sub(1);
    if(environmentId.lt(0)) environmentId = BigNumber.from(numEnvironments).sub(1);
  };
  const next = () => {
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
  <img class="environment" src="assets/environments/{environmentId}/environment.png" alt="Environment #{environmentId}" class:highlight={highlightId && environmentId.eq(highlightId)}>
</Carousel>

<!-- Style -->
<style>
  img.environment {
    display: block;
    width: calc(var(--game-size) * 0.5);
    border-radius: 0.5rem;
  }
  img.environment.highlight {
    outline: 2px solid var(--c2);
  }
</style>