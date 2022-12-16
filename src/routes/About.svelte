<script>
  import Main from "../components/Main.svelte";
</script>

<Main>
  <section class="content-box" style:margin-bottom="2rem">
    <h2 class="center-content">About the Game</h2>
    <p>
      Poolygotchi is a gamified interface for the <a rel="noreferrer" href="https://docs.pooltogether.com/welcome/master" target="_blank">PoolTogether Protocol</a> that is designed to help you save money and meet your personal goals through the support of your digital poolygotchi.
    </p>  
    <p>
      This is an open source project created by the PoolTogether community and funded by an Optimism grant through <a rel="noreferrer" href="https://pooltogether.com/" target="_blank">PoolTogether Inc.</a> The following is the original project proposal and grant request:
    </p>
  </section>

  <section class="center-content">
    <object id="proposal" title="Poolygotchi Project proposal" data="./files/poolygotchi_project_proposal_v1.2.pdf" width="720" height="800">
      <a href="files/poolygotchi_project_proposal_v1.2.pdf" target="_blank">Poolygotchi Project Proposal.pdf</a>
    </object>
  </section>
</Main>

<!-- Style -->
<style>
  #proposal {
    max-width: 100%;
    max-height: 90vh;
  }

  p {
    margin: 2rem 0;
  }
</style>