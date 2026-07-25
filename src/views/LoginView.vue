<script setup>
// Tela de login — autentica usuário por nome/email ou permite acesso como visitante
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const userStore = useUserStore()
const name = ref('')
const email = ref('')
const error = ref('')

onMounted(async () => {
  try {
    await userStore.fetchUsers()
  } catch (err) {
    console.error('Erro ao carregar usuários:', err)
    error.value = 'Erro ao conectar com o servidor. Verifique se o backend está rodando.'
  }
})

// Busca usuário por nome+email e redireciona para home se encontrado
const handleLogin = () => {
  error.value = ''
  const user = userStore.users.find((u) => {
    if (u.type === 'person' && u.person?.email) {
      return (
        u.person.email.toLowerCase() === email.value.toLowerCase() &&
        u.name.toLowerCase() === name.value.toLowerCase()
      )
    }
    return false
  })
  if (user) {
    userStore.setActiveUser(user.id)
    localStorage.setItem('USER_LOGADO', user.id)
    router.push({ name: 'home' })
  } else {
    error.value = 'Usuário não encontrado. Verifique seu nome e email.'
  }
}

// Cria sessão de visitante (sem credenciais) e redireciona para home
const handleGuestLogin = () => {
  error.value = ''
  userStore.setGuestUser()
  router.push({ name: 'home' })
};
</script>

<template>
  <div class="login-view__container">

    <!-- Card que sai por baixo do projetor -->
    <div class="login-view__content">
      <h2 class="login-view__title">Login</h2>
      <form @submit.prevent="handleLogin" class="login-view__form">
        <div class="login-view__form-group">
          <label for="name" class="login-view__label">Nome</label>
          <input id="name" v-model="name" type="text" class="login-view__input" placeholder="seu nome" required />
        </div>
        <div class="login-view__form-group">
          <label for="email" class="login-view__label">Email</label>
          <input id="email" v-model="email" type="email" class="login-view__input" placeholder="seu@email.com"
            required />
        </div>
        <Button type="submit" class="login-view__button">
          Entrar
        </Button>
      </form>
      <div class="login-view__guest-container">
        <Button type="button" class="login-view__guest-btn" @click="handleGuestLogin">
          Entrar como Visitante
        </Button>
      </div>
      <div v-if="error" class="login-view__error-message">
        {{ error }}
      </div>
    </div>

    <div class="login-view__typewriter">
      <img src="../assets/images/login/login_typewriter.png" alt="typewriter" key=""  />
    </div>

  </div>
</template>

<style>
.app__view.app__main-content--login {
  background: var(--accent5_muted);
  padding-top: 1rem;
  width: 100%;
}
</style>

<style scoped>
.login-view__container {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}


.login-view__content {
  position: relative;
  z-index: 2;
  background: url('../assets/images/login/login_bg.png') no-repeat center center;
  background-size: cover;
  color: var(--black);
  padding: 1.25rem;
  max-width: 250px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.18),
    0 4px 12px rgba(0, 0, 0, 0.1);
  animation: ejectCard 2s ease forwards;
}

.login-view__typewriter {
  position: absolute;
  bottom: 5%;
  left: 48%;
  transform: translateX(-50%);
  z-index: 4;
}
.login-view__typewriter img {
  max-width: 400px;
}

@media (max-width: 480px) {
  .login-view__content {
    padding: 1.5rem 1.5rem 1.25rem;
  }
  .login-view__typewriter {
    bottom: -5%;
    left: 46%;
  }

}

@media (max-width: 360px) {
  .login-view__content {
    margin-top: 220px;
    padding: 1rem 0.875rem 0.75rem;
    width: 250px;
  }
}

.login-view__button {
  width: 100%;
}

.login-view__title {
  text-align: center;
}

.login-view__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
} 

.login-view__input:focus {
  outline: none;
  border-color: var(--accent4);
  box-shadow: 0 0 0 3px rgba(209, 151, 147, 0.2);
}

.login-view__error-message {
  margin-top: 0.75rem;
  color: red;
  font-size: 0.875rem;
  text-align: center;
}

@keyframes ejectCard {
  0% {
    transform: translateY(100vh);
    opacity: 0;
  }

  70% {
    transform: translateY(-40px);
    opacity: 1;
  }

  100% {
    transform: translateY(0);
  }
}
</style>
