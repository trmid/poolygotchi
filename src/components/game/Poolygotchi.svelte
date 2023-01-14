<!-- Component -->
<script type="ts">
  import { onDestroy, onMount } from "svelte";
  import { get } from "svelte/store";
  import { fade } from "svelte/transition";
  import { lockable, LockableError } from "../../utils/lockable";
  import type { Animation, State } from "../../utils/poolygotchi";
  import Poolygotchi from "../../utils/poolygotchi";
  import Confetti from "../Confetti.svelte";
  import { focused } from "../Focus.svelte";
  import type { UIButton } from "./game";
  import { gameUI, showMenu } from "./Game.svelte";
  import Speech from "./Speech.svelte";

  // Parameters:
  export let poolygotchi: Poolygotchi;
  export const interact = () => {
    let unlockState: (() => void) | undefined;
    try {
      // Block normal state setting:
      const { unlock, set } = state.lock();
      unlockState = unlock;

      // Break walking animation if currently occurring:
      if($state === 'walking') {
        const t = (Date.now() - walkingStarted) / (1000 * walkingDuration);
        x = walkingFrom + (t * (x - walkingFrom));
        walkingDuration = 0;
      } 

      let newSpeech = "";
      if ($state === 'sleeping') {

        // If napping, don't change the state. Poolygotchi need to sleep!!!
        newSpeech = Poolygotchi.expression($state, name);

      } else {

        // Find key state:
        const possibleStates = poolygotchi.possibleStates(healthFactor).map(x => x.state);
        const keyStates: State[] = ['hibernating', 'happy', 'crying', 'sad', 'neutral']; // in order of importance
        for(let i = 0; i < keyStates.length; i++) {
          if(possibleStates.includes(keyStates[i])) {
            set(keyStates[i]);
            newSpeech = Poolygotchi.expression(keyStates[i], name);
            break;
          }
        }

      }
      setSpeech(newSpeech, unlock);
    } catch(err) {
      unlockState && unlockState();
      if(err instanceof Error && err.message !== 'already locked') {
        console.error(err);
      }
    }
  };

  // Variables:
  let animations: Record<Animation, HTMLImageElement> = {
    crying: new Image(),
    happy: new Image(),
    neutral: new Image(),
    sad: new Image(),
    sleeping: new Image(),
    walking: new Image()
  };
  let name = "";
  let healthFactor = 1;
  let state = lockable<State>('neutral');
  let walkingFrom = 0.5;
  let walkingStarted = 0;
  let walkingDuration = 1;
  let x = 0.5;
  let direction = 1;
  let speech = "";
  let onSpeechClose: (() => void) | null = null;
  let napping = false;
  let confetti = false;
  let hatchingStage: 'bouncing' | 'hatching' | null = null;

  // Reactive variables:
  $: poolygotchi, refresh();
  $: stateAnimation = {
    ...animations,
    hibernating: animations.sleeping
  };
  $: animation = stateAnimation[$state];

  // Function to update animation images from active poolygotchi
  const refresh = () => {
    hatchingStage = null;
    poolygotchi.data().then(data => {
      name = data.name;
      if((Math.floor(Date.now() / 1000) - data.hatchDate.toNumber() < 40)) {
        hatchingStage = 'bouncing';
        setSpeech("The egg looks like it's about to hatch!", hatch);
      }
      for(const key of (Object.keys(animations) as State[])) {
        const url = `assets/species/${data.speciesId.toString()}/${key}.gif`;
        const image = new Image();
        image.src = url;
        animations[key as Animation] = image;
      }
      poolygotchi.healthFactor().then(res => healthFactor = res).catch(console.error);
    }).catch(console.error);
  };

  // Hatch Function:
  const hatch = () => {
    const p = poolygotchi;
    hatchingStage = 'hatching';
    setTimeout(() => {
      if(p != poolygotchi) return;
      try {
        hatchingStage = null;
        confetti = true;
        state.set("happy");
        const { unlock } = state.lock();
        setSpeech(`${name} just hatched!`, unlock);
        setTimeout(() => {
          confetti = false;
        }, 4000);
      } catch(err) {
        console.error(err);
      }
    }, 2000);
  };

  // Function to set the speech content:
  const setSpeech = (message: string, onClose?: () => void) => {
    if(onSpeechClose) try { onSpeechClose(); } catch (err) { console.error(err) };
    speech = message;
    onSpeechClose = onClose ?? null;
  };

  // Decision loop:
  const timer = setInterval(() => {
    try {
      if($focused && !napping && !hatchingStage) {
        const possibleStates: State[] = [];
        for(const possible of poolygotchi.possibleStates(healthFactor)) {
          for(let i = 0; i < possible.chance; i++) {
            possibleStates.push(possible.state);
          }
        }
        state.set(possibleStates[Math.floor(Math.random() * possibleStates.length)]);
        if($state === 'sleeping') {
          napping = true;
          setTimeout(() => napping = false, 30000);
        } else if($state === 'walking') {

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
          setTimeout(() => { state.set('neutral', false); walkingDuration = 0; }, walkingDuration * 1000);
        } else if($state !== 'neutral' && $state !== 'hibernating') {
          setTimeout(() => state.set('neutral', false), 2000);
        }
      }
    } catch(err) {
      if(err instanceof LockableError) console.warn(err);
      else console.error(err);
    }
  }, 6000);

  // On Mount:
  onMount(() => {
    gameUI.push({
      menu: {
        components: [
          { type: "button", name: "<i class='icofont-coins' style='color:hsl(50,75%,64%);'></i>deposit", action: () => { console.log("deposit") } } as UIButton,
          { type: "button", name: "<i class='icofont-star' style='color:hsl(310,75%,64%);'></i>goal", action: () => { console.log("goal") } } as UIButton,
          { type: "button", name: "<i class='icofont-paint' style='color:hsl(30,75%,64%);'></i>personalize", action: () => { console.log("personalize") } } as UIButton,
          { type: "button", name: "<i class='icofont-undo' style='color:hsl(0,75%,64%);'></i>close", action: () => showMenu.set(false) } as UIButton,
          { type: "button", name: "<i class='icofont-exit' style='color:hsl(10,75%,64%);'></i>withdraw", action: () => { console.log("withdraw") } } as UIButton,
          { type: "button", name: "<i class='icofont-game' style='color:hsl(80,75%,64%);'></i>minigames", action: () => { console.log("minigames") }, disabled: true, title: "Coming Soon!" } as UIButton,
          { type: "button", name: "<i class='icofont-ui-home' style='color:hsl(190,75%,64%);'></i>visit", action: () => { console.log("visit") }, disabled: true, title:"Coming Soon!" } as UIButton,
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

{#if hatchingStage}

  <!-- Hatching Animation -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <img
    id="poolygotchi"
    src="assets/egg/{hatchingStage}.gif"
    alt="poolygotchi egg {hatchingStage}"
    style:left="{20 + 60 * x}%"
    on:click={hatch}
    out:fade={{ duration: 2000 }}
  >

{:else}

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

{/if}

<!-- Confetti -->
{#if confetti}
  <Confetti originX={x * 0.6 + 0.2} originY={0.9} />
{/if}

<!-- Speech Bubble -->
{#if speech}
  <Speech {speech} close={() => setSpeech("")} />
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
    cursor: pointer;
  }
</style>