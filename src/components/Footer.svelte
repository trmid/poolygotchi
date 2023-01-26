<script type="ts">
  import { Config } from "../config";
</script>

<!-- Footer -->
<footer class="margins no-select">
  <a class="version" href="https://github.com/trmid/poolygotchi/tree/{Config.build.testnet ? "test" : (Config.build.production ? "main" : "dev")}" target="_blank" rel="noreferrer">
    version {Config.build.version}
  </a>
  <div class="links">
    <a href="https://github.com/trmid/poolygotchi" title="View on Github" target="_blank" rel="noreferrer">
      <img src="img/icon/github.svg" alt="Github">
    </a>
    <a href="https://pooltogether.com/discord" title="Community" target="_blank" rel="noreferrer">
      <img src="img/icon/discord.svg" alt="Discord">
    </a>
    <a href="https://docs.pooltogether.com/" title="About PoolTogether" target="_blank" rel="noreferrer">
      <img src="img/icon/pool-together.svg" alt="PoolTogether Docs">
    </a>
  </div>
  <div class="attributes">
    <i>Made by <a href="https://trmid.eth.limo" target="_blank" rel="noreferrer">trmid</a> and the PoolTogether Community.</i>
    <br>
    <i>Artwork by <a href="https://twitter.com/noiamgodzilla" target="_blank" rel="noreferrer">noiamgodzilla</a>.</i>
  </div>
</footer>

<!-- Style -->
<style>
  footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    opacity: 0.5;
    font-size: small;
    text-align: center;
    margin-top: 5rem;
  }

  a:not(:hover) {
    text-decoration: none;
  }

  footer > .links {
    display: flex;
    justify-content: center;
    gap: 1rem;
    align-items: center;
  }

  footer > .links > a {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.8;
  }

  footer > .links > a:hover {
    opacity: 1;
  }

  footer > .links > a > img {
    width: 24px;
    height: 24px;
    color: var(--c3);
  }

  .attributes {
    font-size: small;
    text-align: center;
    line-height: 1.5;
    opacity: 0.5;
  }

  .version {
    opacity: 0.5;
  }
</style>