<script type="ts">
  const announcements = [
    "Now with more feathers!",
    "Ribbit 🐸",
    "Slow and steady 🐢",
    "Chirp chirp 🐦",
  ];
  let index = Math.floor(Math.random() * announcements.length);
</script>

<header class="margins text-gradient">
  {announcements[index]}
</header>

<style>
  header {
    padding: 1rem;
    text-align: center;
    font-weight: bold;
  }
</style>