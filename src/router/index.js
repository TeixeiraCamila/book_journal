// Configuração do Vue Router — rotas com lazy loading e guard de navegação
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

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
});

// Guard de navegação — verifica sessão (token JWT ou modo visitante) e redireciona
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();

  // Tenta restaurar a sessão do localStorage na primeira passagem
  const hasSession = userStore.userActive !== null || userStore.loadSession();
  const isAuthenticated = hasSession;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' });
  }

  if (to.name === 'login' && isAuthenticated) {
    return next({ name: 'home' });
  }

  next();
});

export default router;