<script type="ts">
  import { BigNumber } from "ethers";
  import { onMount } from "svelte";
  import Poolygotchi, { Animation } from "../../../utils/poolygotchi";
  import Overlay from "../../Overlay.svelte";
  import Carousel from "./Carousel.svelte";

  // Props:
  export let speciesId: BigNumber;
  export let highlightId: BigNumber | undefined = undefined;
  export let size = 0.4;

  // Variables:
  let numSpecies: BigNumber = BigNumber.from(3);
  let expandedSpecies: BigNumber | null = null;
  let animation: Animation = 'neutral';
  let animationTimeout: NodeJS.Timeout | null;

  // Reactive Statements:
  $: speciesId, makeHappy(); // make happy on species change

  // Animation Functions:
  const makeHappy = () => {
    animation = 'happy';
    if(animationTimeout) clearTimeout(animationTimeout);
    animationTimeout = setTimeout(() => animation = 'neutral', 2000);
  };
  
  // Carousel Functions:
  export const prev = () => {
    speciesId = BigNumber.from(speciesId).sub(1);
    if(speciesId.lt(0)) speciesId = BigNumber.from(numSpecies).sub(1);
  };
  export const next = () => {
    speciesId = BigNumber.from(speciesId).add(1);
    if(speciesId.gte(numSpecies)) speciesId = BigNumber.from(0);
  };

  // On Mount:
  onMount(() => {
    Poolygotchi.contract().numSpecies().then(num => numSpecies = num).catch(console.error);
  });
</script>

<!-- Species Carousel -->
<Carousel {prev} {next}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    class="species"
    src="assets/species/{speciesId}/{animation}.gif"
    alt="Species #{speciesId}" class:highlight={highlightId && speciesId.eq(highlightId)}
    style:width="calc(var(--game-size) * {Math.max(0, Math.min(1, size))})"
    on:click={() => expandedSpecies = speciesId }
  >
</Carousel>

<!-- Expanded Species Viewer -->
{#if expandedSpecies}
  <Overlay close={() => expandedSpecies = null} width={300}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <img class="species-large" src="assets/species/{speciesId}/{animation}.gif" alt="Species #{speciesId}" on:click={() => expandedSpecies = null}>
  </Overlay>
{/if}

<!-- Style -->
<style>
  img.species {
    display: block;
    width: calc(var(--game-size) * 0.4);
    border-radius: 0.5rem;
  }
  img.species.highlight {
    outline: 2px dashed var(--c3);
  }
  img.species-large {
    display: block;
    width: 300px;
    max-width: 100%;
    border-radius: 0.5rem;
  }
</style>