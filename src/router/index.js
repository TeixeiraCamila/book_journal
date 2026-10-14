// Configuração do Vue Router — rotas com lazy loading e guard de navegação
import { createRouter, createWebHistory } from 'vue-router';
import { use_user_store } from '@/stores/userStore';

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
let sessao_revalidada = false;

// Guard de navegação — verifica sessão (token JWT ou modo visitante) e redireciona
router.beforeEach(async (to, _from, next) => {
  const userStore = use_user_store();

  // Tenta restaurar a sessão do localStorage na primeira passagem
  const has_session = userStore.user_active !== null || userStore.load_session();

  // O localStorage não prova que o token ainda é aceito pelo backend: pergunta
  // ao /me uma única vez no boot; em 401 o store limpa a sessão antes daqui
  if (has_session && !sessao_revalidada) {
    sessao_revalidada = true;
    await userStore.validate_session();
  }

  // Recalculado depois da validação: um 401 no boot derruba a sessão
  const is_authenticated = userStore.user_active !== null;

  if (to.meta.requiresAuth && !is_authenticated) {
    return next({ name: 'login' });
  }

  if (to.name === 'login' && is_authenticated) {
    return next({ name: 'home' });
  }

  next();
});

export default router;
