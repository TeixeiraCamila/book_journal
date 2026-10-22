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

// Evita revalidar a cada navegação: uma única vez por carga de app
let sessaoRevalidada = false;

// Guard de navegação — verifica sessão (token JWT ou modo visitante) e redireciona
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();

  // Tenta restaurar a sessão do localStorage na primeira passagem
  const hasSession = userStore.userActive !== null || userStore.loadSession();

  // O localStorage não prova que o token ainda é aceito pelo backend: pergunta
  // ao /me uma única vez no boot; em 401 o store limpa a sessão antes daqui
  if (hasSession && !sessaoRevalidada) {
    sessaoRevalidada = true;
    await userStore.validateSession();
  }

  // Recalculado depois da validação: um 401 no boot derruba a sessão
  const isAuthenticated = userStore.userActive !== null;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' });
  }

  if (to.name === 'login' && isAuthenticated) {
    return next({ name: 'home' });
  }

  next();
});

export default router;
