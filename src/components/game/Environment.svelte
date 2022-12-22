<!-- Component -->
<script type="ts">
  import { BigNumberish, BigNumber } from "ethers";
  import { Poolygotchi } from "../../utils/poolygotchi";
  import { normalizeImageURI } from "../../utils/uri";
  export let environmentId: BigNumberish;
</script>

<!-- Environment -->
{#await Poolygotchi.function("environmentURI")(BigNumber.from(environmentId)) then uri}
  {#await normalizeImageURI(uri + "/environment.png", "image/png") then environmentImageURI}
  <img id="background" src="{environmentImageURI}" alt="background environment" />
  {/await}
{/await}

<!-- Style -->
<style>
  #background {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
  }
</style>