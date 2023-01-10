<!-- Component -->
<script type="ts">
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";
  import type { State } from "../../utils/poolygotchi";
  import Poolygotchi from "../../utils/poolygotchi";
  import { focused } from "../Focus.svelte";
  import type { UIButton } from "./game";
  import { gameUI, showMenu } from "./Game.svelte";
  import Speech from "./Speech.svelte";

  // Parameters:
  export let poolygotchi: Poolygotchi;
  export const interact = () => {
    try {
      // Block normal state setting:
      unlock = setStateLock();

      // Break walking animation if currently occurring:
      if(state === 'walking') {
        const t = (Date.now() - walkingStarted) / (1000 * walkingDuration);
        console.log(t);
        x = x - (t * (x - walkingFrom));
        walkingDuration = 0;
      } 

      if (state === 'sleeping') {

        // If napping, don't change the state. Poolygotchi need to sleep!!!
        speech = Poolygotchi.expression(state, name);

      } else {

        // Find key state:
        const possibleStates = poolygotchi.possibleStates(healthFactor).map(x => x.state);
        const keyStates: State[] = ['hibernating', 'happy', 'crying', 'sad', 'neutral']; // in order of importance
        for(let i = 0; i < keyStates.length; i++) {
          if(possibleStates.includes(keyStates[i])) {
            state = keyStates[i];
            speech = Poolygotchi.expression(state, name);
            break;
          }
        }

      }
    } catch(err) {
      if(err instanceof Error && err.message !== 'already locked') {
        console.error(err);
      }
    }
  };

  // Variables:
  let animations: Record<State, HTMLImageElement> = {
    crying: new Image(),
    happy: new Image(),
    neutral: new Image(),
    sad: new Image(),
    sleeping: new Image(),
    hibernating: new Image(),
    walking: new Image()
  };
  let name = "";
  let healthFactor = 1;
  let state: State = 'neutral';
  let stateLock = false; // do not modify directly, use setStateLock() instead
  let unlock: (() => void) | null = null;
  let walkingFrom = 0.5;
  let walkingStarted = 0;
  let walkingDuration = 1;
  let x = 0.5;
  let direction = 1;
  let speech = "";
  let napping = false;

  // Reactive variables:
  $: poolygotchi, refresh();
  $: animation = animations[state];

  // Function to update animation images from active poolygotchi
  const refresh = () => {
    poolygotchi.data().then(data => {
      name = data.name;
      for(const key of (Object.keys(animations) as State[])) {
        const url = `assets/species/${data.speciesId.toString()}/${key === 'hibernating' ? 'sleeping' : key}.gif`;
        const image = new Image();
        image.src = url;
        animations[key as (keyof typeof animations)] = image;
      }
      poolygotchi.healthFactor().then(res => healthFactor = res).catch(console.error);
    }).catch(console.error);
  };

  // Function to lock the animation state control:
  const setStateLock = () => {
    if(stateLock) throw new Error('already locked');
    stateLock = true;
    return () => {
      stateLock = false;
    }
  };

  // Function to set the animation state without interrupting interactions:
  const setState = (newState: State) => {
    if(!stateLock) state = newState;
  };

  // Decision loop:
  const timer = setInterval(() => {
    if($focused && !napping) {
      const possibleStates: State[] = [];
      for(const { state, chance } of poolygotchi.possibleStates(healthFactor)){
        for(let i = 0; i < chance; i++) {
          possibleStates.push(state);
        }
      }
      setState(possibleStates[Math.floor(Math.random() * possibleStates.length)]);
      if(state === 'sleeping') {
        napping = true;
        setTimeout(() => napping = false, 30000);
      } else if(state === 'walking') {

        // Generate new position:
        let walkTo = Math.random();
        
        // Ensure position is decently far from current position:
        if(Math.abs(walkTo - x) < .1) walkTo = 1 - walkTo;

        // Update poolygotchi walking state:
        walkingFrom = x;
        walkingStarted = Date.now();
        walkingDuration = Math.abs(walkTo - x) * 5;
        if(walkTo > x) direction = 1;
        else direction = -1;
        x = walkTo;
        setTimeout(() => { setState('neutral'); walkingDuration = 0; }, walkingDuration * 1000);
      } else if(state !== 'neutral' && state !== 'hibernating') {
        setTimeout(() => setState('neutral'), 2000);
      }
    }
  }, 6000);

  // On Mount:
  onMount(() => {
    gameUI.push({
      menu: {
        components: [
          { type: "button", name: "btn1", action: () => { console.log("btn1") } } as UIButton,
          { type: "button", name: "btn2", action: () => { console.log("btn2") } } as UIButton,
          { type: "button", name: "close", action: () => showMenu.set(false) } as UIButton
        ],
        index: 0
      },
      buttons: {
        left: { title: "Home", class: "icofont-ui-home", action: () => {showMenu.set(false)} },
        middle: { title: "Interact!", class: "icofont-comment", action: () => { showMenu.set(false); interact(); } },
        right: { title: "Menu", class: "icofont-navigation-menu", action: () => showMenu.set(!get(showMenu)) },
      }
    });
  });

  // On Destroy:
  onDestroy(() => {
    clearInterval(timer);
    gameUI.pop();
  });
</script>

<!-- Poolygotchi -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<img
  id="poolygotchi"
  src={animation.src}
  alt="Poolygotchi of {poolygotchi.address.slice(0, 6)}..."
  style:transition-duration="{walkingDuration}s"
  style:transform="translateX(-50%) scaleX({direction})"
  style:left="{20 + 60 * x}%"
  on:click={interact}
>

<!-- Speech Bubble -->
{#if speech && unlock}
  <Speech {speech} close={() => { speech = ""; unlock && unlock(); }} />
{/if}

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