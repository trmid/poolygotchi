<script type="ts">
  import Title from "./Title.svelte";
  import Nav from "./Nav.svelte";

  const announcements = [
    "Now with more feathers!",
    "Ribbit 🐸",
    "Slow and steady 🐢",
    "Chirp chirp 🐦",
    "Ready to play and save?",
    "Play or save? Why not both?"
  ];
  let index = Math.floor(Math.random() * announcements.length);
</script>

<header class="margins">

  <!-- Silly Announcements -->
  <div class="text-gradient">{announcements[index]}</div>

  <!-- Title -->
  <Title />

</header>

<!-- Nav -->
<Nav />

<style>
  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    text-align: center;
    font-weight: bold;
  }
</style>