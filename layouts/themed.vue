<template>
  <div class="text-white relative overflow-hidden background-theme">
    <Background />
    <slot />
  </div>
</template>

<script setup>
import Background from "~/components/Background.vue";
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #121212;
}
</style> 