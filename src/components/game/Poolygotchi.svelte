<!-- Component -->
<script type="ts">
  import { onDestroy } from "svelte/types/runtime/internal/lifecycle";
  import { poolygotchi } from "./Game.svelte";

  type Emotion = 'crying' | 'happy' | 'neutral' | 'sad' | 'sleeping' |'walking';

  let animations: Record<Emotion, HTMLImageElement> = {
    crying: new Image(),
    happy: new Image(),
    neutral: new Image(),
    sad: new Image(),
    sleeping: new Image(),
    walking: new Image()
  };
  let healthFactor = 1;
  let emotion: Emotion = 'neutral';
  $: if($poolygotchi) {
    const _poolygotchi = $poolygotchi;
    _poolygotchi.data().then(data => {
      for(const key in animations) {
        const url = `assets/species/${data.speciesId.toString()}/${key}.gif`;
        const image = new Image();
        image.src = url;
        animations[key as (keyof typeof animations)] = image;
      }
      _poolygotchi.healthFactor().then(res => healthFactor = res).catch(console.error);
    }).catch(console.error);
  }
  $: animation = animations[emotion];
  const timer = setInterval(() => {
    emotion = (<Emotion[]>['neutral', 'crying', 'happy', 'sad', 'sleeping', 'walking'])[Math.floor(Math.random() * 6)];
  }, 1000);
  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<!-- Poolygotchi -->
{#if $poolygotchi}
<img src={animation.src} alt="Poolygotchi of {$poolygotchi.address.slice(0, 6)}...">
{/if}

<!-- Style -->
<style>
  #poolygotchi {
    width: var(--game-size * 0.2);
    left: 40%;
    bottom: 10%;
  }
</style>