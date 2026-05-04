<script setup>
import { LogOut } from 'lucide-vue-next'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { useUserStore } from '@/stores/userStore'
import router from '@/router'

import Button from '../ui/Button.vue'

const bookStore = useBookStore()
const userStore = useUserStore()

// sticky on scroll
const isSticky = ref(false)
const headerRef = ref(null)
const headerHeight = ref(0)

const onScroll = () => {
  const y = window.scrollY || window.pageYOffset
  isSticky.value = y > 10
}

const updateHeaderHeight = () => {
  if (headerRef.value) headerHeight.value = headerRef.value.offsetHeight
}

const handleLogout = () => {
  userStore.clearActiveUser()
  router.push({ name: 'login' })
}

onMounted(async () => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateHeaderHeight)

  await nextTick()
  updateHeaderHeight()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateHeaderHeight)
});
</script>
<template>
  <header class="header" :class="{ 'header--fixed': isSticky }">
    <div class="header__content container flex items-center justify-between">
      <div class="header__info">
        <div class="header__logo">
          <router-link to="{ name: 'home', params: {  }"><span class="header__logo-icon">📚</span></router-link>
        </div>
        <div>
          <h1 class="header__title">My Book Journal</h1>
          <p class="header__subtitle">{{ bookStore.bookCount }} livros cadastrados</p>
        </div>
      </div>

      <div class="header__actions">
        <router-link to="/stats" class="header__btn header__btn--stats"> 📊 Estatísticas </router-link>

        <router-link to="/criar" class="header__btn header__btn--add"> ➕ Adicionar Livro </router-link>

        <Button class="header__btn header__btn--logout" @click="handleLogout"><LogOut /></Button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: linear-gradient(
    to bottom right,
    rgba(255, 249, 238, 0.8),
    rgba(255, 255, 255, 0.8),
    rgba(255, 249, 238, 0.8)
  );
  box-shadow: var(--shadow);
  /* position: relative; */
  backdrop-filter: blur(4px);
}

.header.header--fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 99;
  animation: slideDown 0.3s ease forwards;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }

  to {
    transform: translateY(0);
  }
}

.header__info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header__logo {
  background: var(--accent);
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.header__logo-icon {
  font-size: 1.5rem;
  filter: grayscale(1) brightness(10);
}

.header__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--black);
  margin: 0;
}

.header__subtitle {
  font-size: 0.875rem;
  color: var(--muted);
  margin: 0;
}

.header__btn {
  display: flex;
  align-items: center;
}

.header__btn--add {
  gap: 0.5rem;
}

.header__actions {
  display: flex;
  gap: 0.75rem;
}
</style>
