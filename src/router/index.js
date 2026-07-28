// Configuração do Vue Router — rotas com lazy loading e guard de navegação
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/CardStackView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/criar',
      name: 'create',
      component: () => import('@/views/CreateBookView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/editar/:id',
      name: 'edit',
      component: () => import('@/views/CreateBookView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Guard de navegação — verifica autenticação e redireciona conforme necessário
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const saved = localStorage.getItem('USER_LOGADO')
  const isGuest = localStorage.getItem('IS_GUEST') === 'true'

  // Verifica se é usuário visitante
  if (isGuest && saved === 'guest') {
    userStore.initGuestSession()
  } else if (saved) {
    userStore.userActive = saved
  }

  const requiresAuth = to.meta.requiresAuth
  const isAuthenticated = userStore.userActive !== null || userStore.isGuest

  // precisa de autenticação e o usuário não está logado
  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }

  // se o usuário está logado e tenta acessar o login
  else if (to.name === 'login' && isAuthenticated) {
    return next({ name: 'home' })
  } else {
    next()
  }
})

export default router
