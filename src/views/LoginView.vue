<script setup>
// Tela de entrada — duas etapas: chegada (escolher como entrar) e entrada
// (email + código de acesso). Visitante segue como sessão de leitura.
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { use_user_store } from '@/stores/userStore';
import Button from '@/components/ui/Button.vue';

const router = useRouter();
const userStore = use_user_store();

const step = ref('entry');
const email = ref('');
const codigo = ref('');
const error = ref('');
const submitting = ref(false);

const go_to_form = () => {
  step.value = 'form';
};

const back_to_entry = () => {
  step.value = 'entry';
  error.value = '';
};

// Entra como visitante: sessão de leitura sem conta, sem token
const handle_guest_login = () => {
  error.value = '';
  userStore.set_guest_user();
  router.push({ name: 'home' });
};

// Autentica com email + código de acesso no backend
const handle_login = async () => {
  error.value = '';
  submitting.value = true;

  try {
    await userStore.login({ email: email.value.trim(), codigo: codigo.value });
    router.push({ name: 'home' });
  } catch {
    error.value = userStore.error || 'Não foi possível entrar agora.';
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="login-view__container">
    <!-- Etapa 1: chegada -->
    <div v-if="step === 'entry'" class="login-view__content">
      <h2 class="login-view__title">Diário de Leitura</h2>
      <p class="login-view__subtitle">Sua estante espera por você.</p>

      <form class="login-view__form" @submit.prevent="go_to_form">
        <Button type="submit" class="login-view__button"> Entrar no diário </Button>
      </form>

      <button type="button" class="login-view__guest" @click="handle_guest_login">
        Só observar
      </button>
    </div>

    <!-- Etapa 2: entrada -->
    <form v-else class="login-view__content" @submit.prevent="handle_login">
      <h2 class="login-view__title">Quem está entrando?</h2>

      <div class="login-view__form-group">
        <label for="email" class="login-view__label">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="login-view__input"
          placeholder="seu@email.com"
          autocomplete="email"
          required
        />
      </div>

      <div class="login-view__form-group">
        <label for="codigo" class="login-view__label">Código de acesso</label>
        <input
          id="codigo"
          v-model="codigo"
          type="password"
          class="login-view__input"
          placeholder="••••••"
          autocomplete="current-password"
          required
        />
      </div>

      <p v-if="error" class="login-view__error-message" role="alert" aria-live="polite">
        {{ error }}
      </p>

      <Button type="submit" class="login-view__button" :disabled="submitting">
        {{ submitting ? 'Entrando…' : 'Entrar' }}
      </Button>

      <button type="button" class="login-view__back" @click="back_to_entry">Voltar</button>
    </form>

    <div class="login-view__typewriter">
      <img src="../assets/images/login/login_typewriter.png" alt="" />
    </div>
  </div>
</template>

<style scoped>
.login-view__container {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-view__content {
  position: relative;
  z-index: 2;
  width: min(250px, 82vw);
  /* proporção real de login_bg.png: se o asset mudar, revisar aqui */
  aspect-ratio: 434 / 626;
  background: url('../assets/images/login/login_bg.png') no-repeat center center;
  background-size: cover;
  color: var(--black);
  padding: 1.5rem 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.15),
    0 2px 6px rgba(0, 0, 0, 0.08);
  animation: ejectCard 2s ease forwards;
}

.login-view__title {
  text-align: center;
  font-size: 1.15rem;
}

.login-view__subtitle {
  text-align: center;
  font-family: 'Raleway', sans-serif;
  font-size: 0.8rem;
  opacity: 0.85;
  margin: 0.25rem 0 1.25rem;
}

.login-view__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.login-view__form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.login-view__label {
  font-family: 'Raleway', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.02em;
}

.login-view__input {
  background: rgba(255, 249, 238, 0.85);
  caret-color: var(--accent4);
}

.login-view__input:focus {
  outline: none;
  box-shadow: -3px 3px 0 var(--accent4);
}

.login-view__button {
  width: 100%;
}

/* Ações secundárias: visitante e voltar como texto, não botão */
.login-view__guest,
.login-view__back {
  display: block;
  margin: 0 auto;
  height: auto;
  width: auto;
  padding: 0.35rem 0.5rem;
  background: none;
  box-shadow: none;
  color: var(--muted);
  font-family: 'Raleway', sans-serif;
  font-size: 0.75rem;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.login-view__guest:hover,
.login-view__back:hover {
  transform: none;
  box-shadow: none;
  color: var(--accent4);
}

.login-view__error-message {
  margin-top: 0.5rem;
  color: var(--danger);
  font-family: 'Raleway', sans-serif;
  font-size: 0.75rem;
}

.login-view__typewriter {
  position: absolute;
  bottom: 0;
  left: 48%;
  transform: translateX(-50%);
  z-index: 4;
}

.login-view__typewriter img {
  width: min(400px, 88vw);
  height: auto;
  max-width: none;
}

@media (max-width: 360px) {
  .login-view__content {
    padding: 1rem 0.875rem 0.75rem;
  }
}

@keyframes ejectCard {
  0% {
    transform: translateY(100vh);
    opacity: 0;
  }

  70% {
    transform: translateY(-30px);
    opacity: 1;
  }

  100% {
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-view__content {
    animation: none;
  }
}
</style>
