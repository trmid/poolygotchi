<script type="ts">
  import { Config } from "../config";
</script>

<!-- Footer -->
<footer class="margins">
  <span class="no-select">Made by the PoolTogether Community</span>
  <a href="https://github.com/trmid/poolygotchi/tree/{Config.build.testnet ? "test" : (Config.build.production ? "main" : "dev")}" target="_blank" rel="noreferrer">
    version {Config.build.version}
  </a>
</footer>

<!-- Style -->
<style>
  footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.5;
    font-size: small;
    text-align: center;
    margin-top: 3rem;
  }

  a:not(:hover) {
    text-decoration: none;
  }
</style>