<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
</script>

<template>
  <div class="app__view" :class="{ 'app__main-content--login': route.name === 'login' }">
    <main class="app__main-content">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </main>
  </div>
</template>

<style>
.app__view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.app__main-content {
  width: 100%;
}
</style>
