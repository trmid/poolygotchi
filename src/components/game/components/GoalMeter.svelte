<script type="ts">
  import type { BigNumber } from "ethers";
  import Poolygotchi from "../../../utils/poolygotchi";

  // Props:
  export let healthFactor: number;

  // Reactive Variables:
  $: indicatorLeftPercent = Math.max(10, Math.min(90, (0.5 + healthFactor / 8) * 100));
  
</script>

<div id="container">
  <div id="wrapper">

    <!-- Meter -->
    <div id="meter">
      <div id="sad" class="tick" title="3 Weeks Behind" />
      <div id="unhappy" class="tick" title="2 Weeks Behind" />
      <div id="neutral" class="tick" title="1 Week Behind" />
      <div id="happy" class="tick" title="⭐ Goal ⭐" />
      <div id="happy-1" class="tick" title="1 Week Ahead" />
      <div id="happy-2" class="tick" title="2 Weeks Ahead" />
      <div id="happy-3" class="tick" title="3 Weeks Ahead" />

      <!-- Indicator -->
      <i class="indicator icofont-caret-down" style:left="{indicatorLeftPercent}%" />
      <img class="indicator" title="{healthFactor.toFixed(2)}" src="assets/species/0/{Poolygotchi.possibleStates(healthFactor)[0].animation}.gif" alt="poolygotchi" style:left="{indicatorLeftPercent}%">
    </div>
  </div>

  <!-- Goal Star -->
  <div id="goal-star-container">
    <i id="goal-star" class="icofont-star" title="Goal" />
  </div>
</div>

<!-- Style -->
<style>
  #wrapper {
    position: relative;
  }

  #wrapper::before {
    content: "";
    position: absolute;
    inset: -5px;
    background: var(--bg-gradient);
    box-shadow: 2px 4px 7px var(--shadow-color);
    border-radius: 2rem;
    border: 2px solid var(--c3);
  }

  #meter {
    position: relative;
    height: 2.5rem;
    border-radius: 2rem;
    background: linear-gradient(to right, var(--c4) 0%, var(--c3) 25%, var(--c2) 50%, gold 75%);
    z-index: 1;
  }

  .indicator {
    position: absolute;
    left: 0;
    transform: translateX(-50%);
    transition: left 2s ease-in-out;
  }

  i.indicator {
    font-size: 24px;
    top: -12px;
    color: var(--c3);
  }

  img.indicator {
    width: 2.5rem;
    bottom: -4px;
  }

  #goal-star-container {
    position: relative;
    height: 22px;
    margin-top: 7px;
  }

  #goal-star {
    display: block;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 22px;
    color: var(--c3);
  }

  #goal-star::after {
    content: "\f000";
    position: absolute;
    inset: 4px;
    font-size: 14px;
    color: var(--c2)
  }

  .tick {
    position: absolute;
    top: 80%;
    left: 0;
    bottom: 0;
    background-color: var(--c0);
    width: 1px;
  }

  #sad.tick {
    left: 12.75%;
  }

  #unhappy.tick {
    left: 25%;
  }

  #neutral.tick {
    left: 37.75%;
  }

  #happy.tick {
    left: 50%;
    top: 50%;
  }

  #happy-1.tick {
    left: 62.75%;
  }

  #happy-2.tick {
    left: 75%;
  }

  #happy-3.tick {
    left: 87.75%;
  }
</style>