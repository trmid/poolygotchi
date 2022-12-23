<!-- Component -->
<script type="ts">
  import { onDestroy } from "svelte";
  import type { Poolygotchi } from "../../utils/poolygotchi";

  export let poolygotchi: Poolygotchi;

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
  $: poolygotchi, updateAnimations();
  $: animation = animations[emotion];
  const updateAnimations = () => {
    poolygotchi.data().then(data => {
      console.log(data);
      for(const key of (Object.keys(animations) as Emotion[])) {
        const url = `assets/species/${data.speciesId.toString()}/${key}.gif`;
        const image = new Image();
        image.src = url;
        animations[key as (keyof typeof animations)] = image;
      }
      console.log(animations);
      poolygotchi.healthFactor().then(res => healthFactor = res).catch(console.error);
    }).catch(console.error);
  };
  const timer = setInterval(() => {
    emotion = (<Emotion[]>['neutral', 'crying', 'happy', 'sad', 'sleeping', 'walking'])[Math.floor(Math.random() * 6)];
  }, 2000);
  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<!-- Poolygotchi -->
<img id="poolygotchi" src={animation.src} alt="Poolygotchi of {poolygotchi.address.slice(0, 6)}...">

<!-- Style -->
<style>
  #poolygotchi {
    position: absolute;
    width: calc(var(--game-size) * 0.4);
    left: 50%;
    bottom: 10%;
    transform: translateX(-50%);
  }
</style>