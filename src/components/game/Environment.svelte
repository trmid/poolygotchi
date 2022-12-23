<!-- Component -->
<script type="ts">
  import type { BigNumberish, BigNumber } from "ethers";
  import { Poolygotchi } from "../../utils/poolygotchi";
  import { normalizeImageURI } from "../../utils/uri";
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