<script setup lang="ts">

const viteLogo = new URL('../../assets/vite.svg', import.meta.url).href
const vueLogo = new URL('../../assets/vue.png', import.meta.url).href
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <!-- Logo here -->
      <img class="logo" :src="viteLogo" alt="Vite Logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <!-- Logo here -->
      <img class="logo" :src="vueLogo" alt="Vite Logo" />
    </a>
  </div>
  <nav>
    <RouterLink to="/foo">Go to Foo</RouterLink>
    <RouterLink to="/bar">Go to Bar</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

nav a {
  margin-left: 8px;
}
</style>
