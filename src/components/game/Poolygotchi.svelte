<!-- Component -->
<script type="ts">
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";
  import type Poolygotchi from "../../utils/poolygotchi";
  import type { UIButton } from "./game";
  import { buttons, menuComponents, menuSelectedIndex, setDefaultUI, showMenu } from "./Game.svelte";

  // Parameters:
  export let poolygotchi: Poolygotchi;

  // Types:
  type State = 'crying' | 'happy' | 'neutral' | 'sad' | 'sleeping' |'walking';

  // Variables:
  let animations: Record<State, HTMLImageElement> = {
    crying: new Image(),
    happy: new Image(),
    neutral: new Image(),
    sad: new Image(),
    sleeping: new Image(),
    walking: new Image()
  };
  let healthFactor = 1;
  let state: State = 'neutral';
  let walkingDuration = 1;
  let x = 0.5;
  let direction = 1;

  // Reactive variables:
  $: poolygotchi, updateAnimations();
  $: animation = animations[state];

  // Function to update animation images from active poolygotchi
  const updateAnimations = () => {
    poolygotchi.data().then(data => {
      console.log(data);
      for(const key of (Object.keys(animations) as State[])) {
        const url = `assets/species/${data.speciesId.toString()}/${key}.gif`;
        const image = new Image();
        image.src = url;
        animations[key as (keyof typeof animations)] = image;
      }
      console.log(animations);
      poolygotchi.healthFactor().then(res => healthFactor = res).catch(console.error);
    }).catch(console.error);
  };

  // Decision loop:
  const timer = setInterval(() => {
    if(healthFactor < -2) {
      state = 'sleeping';
    } else {
      const possibleStates: State[] = ['neutral', 'walking'];
      if(healthFactor >= 0) possibleStates.push('happy');
      else possibleStates.push('sad');
      if(healthFactor < -1) possibleStates.push('crying');
      state = possibleStates[Math.floor(Math.random() * possibleStates.length)];
      if(state === 'walking') {

        // Generate new position:
        let walkTo = Math.random();
        
        // Ensure position is decently far from current position:
        if(Math.abs(walkTo - x) < .1) walkTo = 1 - walkTo;

        // Update poolygotchi walking state:
        walkingDuration = Math.abs(walkTo - x) * 5;
        if(walkTo > x) direction = 1;
        else direction = -1;
        x = walkTo;
        setTimeout(() => state = 'neutral', walkingDuration * 1000);
      } else if(state !== 'neutral') {
        setTimeout(() => state = 'neutral', 2000);
      }
    }
  }, 6000);

  // On Mount:
  onMount(() => {
    $buttons = {
      left: { title: "Home", class: "icofont-ui-home", action: () => {console.log("home")} },
      middle: { title: "Interact!", class: "icofont-comment", action: () => {console.log("interact")} },
      right: { title: "Menu", class: "icofont-navigation-menu", action: () => showMenu.set(!get(showMenu)) },
    };
    $menuSelectedIndex = 0;
    $menuComponents = [
      { type: "button", name: "btn1", action: () => { console.log("btn1") } } as UIButton,
      { type: "button", name: "btn2", action: () => { console.log("btn2") } } as UIButton,
      { type: "button", name: "close", action: () => showMenu.set(false) } as UIButton
    ];
  });

  // On Destroy:
  onDestroy(() => {
    clearInterval(timer);
    setDefaultUI();
  });
</script>

<!-- Poolygotchi -->
<img
  id="poolygotchi"
  src={animation.src}
  alt="Poolygotchi of {poolygotchi.address.slice(0, 6)}..."
  style:transition-duration="{walkingDuration}s"
  style:transform="translateX(-50%) scaleX({direction})"
  style:left="{20 + 60 * x}%"
>

<!-- Style -->
<style>
  #poolygotchi {
    position: absolute;
    width: calc(var(--game-size) * 0.4);
    left: 50%;
    bottom: 10%;
    transform: translateX(-50%);
    transition-property: left;
    transition-timing-function: linear;
  }
</style>