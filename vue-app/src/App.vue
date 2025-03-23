<script setup lang="ts">
import { watch } from 'vue';
// import HelloWorld from './components/HelloWorld.vue'

type Data = {
  channel: string;
  data: any;
};

const vueLogo = new URL('./assets/vue.png', import.meta.url).href

const props = defineProps<{
  inputData: Data;
  outputData: (data: Data) => void;
}>()

watch(props.inputData, (newData) => {
  console.log('New data received:', newData.channel, newData.data)
})

function handleOutputData() {
  props.outputData?.({
    channel: 'VUE_WIDGET',
    data: 'Hello from Vue!'
  })
}

</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <!-- Logo here -->
      <img class="logo" :src="vueLogo" alt="Vue Logo" />
    </a>
    <h2>Input Data</h2>
    <pre>{{ props.inputData }}</pre>
    <button @click="handleOutputData">Click me</button>
  </div>
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
</style>
