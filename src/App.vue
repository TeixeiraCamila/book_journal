<script setup>
// Componente raiz — renderiza a rota ativa com botão de saída quando autenticado
import { RouterView, useRoute, useRouter } from 'vue-router';
import { use_user_store } from '@/stores/userStore';

const route = useRoute();
const router = useRouter();
const userStore = use_user_store();

const handle_logout = () => {
  userStore.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="app__view">
    <button
      v-if="route.name !== 'login' && userStore.user_active"
      type="button"
      class="app__logout"
      @click="handle_logout"
    >
      Sair
    </button>
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
  width: 100%;
}
.app__main-content {
  width: 100%;
}
</style>

<style scoped>
.app__logout {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
  width: auto;
  height: auto;
  padding: 0.4rem 1rem;
  background: var(--white);
  color: var(--black);
  font-family: 'Raleway', sans-serif;
  font-size: 0.8rem;
  border: 1px solid var(--accent4);
  border-radius: 999px;
  box-shadow: none;
}

.app__logout:hover {
  transform: none;
  box-shadow: none;
  border-color: var(--accent4);
  background: var(--accent_muted);
}
</style>
