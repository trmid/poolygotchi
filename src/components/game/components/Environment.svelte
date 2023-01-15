<!-- Component -->
<script type="ts">
  import type { BigNumberish } from "ethers";
  export let environmentId: BigNumberish;
</script>

<!-- Environment -->
<img id="background" src="assets/environments/{environmentId}/environment.png" alt="background environment" />

<!-- Style -->
<style>
  #background {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
  }
</style>