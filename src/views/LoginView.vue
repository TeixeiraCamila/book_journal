<script setup>
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
      <form @submit.prevent="handleLogin">
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
          <span>Entrar</span>
        </Button>
      </form>
      <div class="login-view__guest-container">
        <Button type="button" class="login-view__guest-btn" @click="handleGuestLogin">
          <span>Entrar como Visitante</span>
        </Button>
      </div>
      <div v-if="error" class="login-view__error-message">
        {{ error }}
      </div>
    </div>

    <!-- Projetor SVG: flutua por CIMA do card -->

    <div class="reader reader__front">
      <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M349.867 51.2H162.133V8.533C162.133 3.82 165.954 0 170.666 0H341.333C346.046 0 349.866 3.821 349.866 8.533V51.2H349.867Z"
          fill="#4E5058" />
        <path
          d="M187.733 0H170.666C165.953 0 162.133 3.821 162.133 8.533V51.2H179.2V8.533C179.2 3.821 183.021 0 187.733 0Z"
          fill="#383A43" />
        <path
          d="M469.333 256H42.667V42.667C42.667 37.954 46.488 34.134 51.2 34.134H460.8C465.513 34.134 469.333 37.955 469.333 42.667V256Z"
          fill="#D3D3D5" />
        <path
          d="M68.267 34.133H51.2C46.487 34.133 42.667 37.954 42.667 42.666V256H59.734V42.667C59.733 37.954 63.554 34.133 68.267 34.133Z"
          fill="#BDBDC0" />
        <path d="M503.467 349.867H8.53302L42.667 256H469.333L503.467 349.867Z" fill="#E9E9EA" />
        <path d="M42.667 256L8.53302 349.867H25.6L59.733 256H42.667Z" fill="#D3D3D5" />
        <path
          d="M494.482 408H17.5169C12.8128 408 9 406.002 9 403.539V350H503V403.539C503 406.002 499.186 408 494.482 408Z"
          fill="#4E5058" />
        <path
          d="M27.5 408C24.1 408 25.6 398.774 25.6 397.52V349.866H8.53302V404.328C8.53302 406.834 12.788 408 17.5 408H27.5Z"
          fill="#383A43" />
        <path
          d="M426.667 153.6H358.4C353.687 153.6 349.867 149.779 349.867 145.067V76.8C349.867 72.087 353.688 68.267 358.4 68.267H426.667C431.38 68.267 435.2 72.088 435.2 76.8V145.067C435.2 149.779 431.379 153.6 426.667 153.6Z"
          fill="#E9E9EA" />
        <path d="M358.4 68.267C353.687 68.267 349.867 72.088 349.867 76.8V117.867L399.467 68.267H358.4Z"
          fill="#A7A7AB" />
        <path
          d="M434.441 73.293L354.894 152.84C355.965 153.324 357.15 153.599 358.401 153.599H389.868L435.201 108.266V76.8C435.2 75.549 434.924 74.364 434.441 73.293Z"
          fill="#A7A7AB" />
        <path d="M404.8 153.6H426.667C431.38 153.6 435.2 149.779 435.2 145.067V123.2L404.8 153.6Z" fill="#A7A7AB" />
        <path
          d="M426.667 68.267H358.4C353.687 68.267 349.867 72.088 349.867 76.8V145.067C349.867 149.78 353.688 153.6 358.4 153.6H426.667C431.38 153.6 435.2 149.779 435.2 145.067V76.8C435.2 72.087 431.379 68.267 426.667 68.267ZM426.667 145.067H358.4V76.8H426.667V145.067Z"
          fill="#7A7C82" />
        <path
          d="M424.205 383H78.7937C72.832 383 68 384.866 68 387.167V395.5V408C71 408 77 408 77 408H424.205C430.167 408 435 408 435 408V395.5V387.167C435 384.866 430.167 383 424.205 383Z"
          fill="#7A7C82" />
        <path
          d="M136.533 221.867C150.671 221.867 162.133 210.405 162.133 196.267C162.133 182.129 150.671 170.667 136.533 170.667C122.394 170.667 110.933 182.129 110.933 196.267C110.933 210.405 122.394 221.867 136.533 221.867Z"
          fill="#D14D7B" />
        <path
          d="M136.533 213.334C145.959 213.334 153.6 205.693 153.6 196.267C153.6 186.841 145.959 179.2 136.533 179.2C127.107 179.2 119.466 186.841 119.466 196.267C119.466 205.693 127.107 213.334 136.533 213.334Z"
          fill="#FD5E95" />
        <path
          d="M375.467 221.867C389.605 221.867 401.067 210.405 401.067 196.267C401.067 182.129 389.605 170.667 375.467 170.667C361.329 170.667 349.867 182.129 349.867 196.267C349.867 210.405 361.329 221.867 375.467 221.867Z"
          fill="#64666D" />
        <path
          d="M375.467 221.867C389.605 221.867 401.067 210.405 401.067 196.267C401.067 182.129 389.605 170.667 375.467 170.667C361.329 170.667 349.867 182.129 349.867 196.267C349.867 210.405 361.329 221.867 375.467 221.867Z"
          fill="#64666D" />
        <path
          d="M256 221.867C298.415 221.867 332.8 187.482 332.8 145.067C332.8 102.652 298.415 68.267 256 68.267C213.585 68.267 179.2 102.652 179.2 145.067C179.2 187.482 213.585 221.867 256 221.867Z"
          fill="#909296" />
        <path
          d="M256 204.8C288.99 204.8 315.733 178.057 315.733 145.067C315.733 112.077 288.99 85.334 256 85.334C223.01 85.334 196.267 112.077 196.267 145.067C196.267 178.057 223.01 204.8 256 204.8Z"
          fill="#64666D" />
        <path
          d="M273.067 187.733C240.077 187.733 213.334 160.99 213.334 128C213.334 115.871 216.96 104.593 223.171 95.17C206.967 105.854 196.268 124.206 196.268 145.067C196.268 178.057 223.011 204.8 256.001 204.8C276.862 204.8 295.214 194.1 305.898 177.897C296.474 184.108 285.196 187.733 273.067 187.733Z"
          fill="#4E5058" />
        <path
          d="M273.067 136.534C282.493 136.534 290.134 128.893 290.134 119.467C290.134 110.041 282.493 102.4 273.067 102.4C263.641 102.4 256 110.041 256 119.467C256 128.893 263.641 136.534 273.067 136.534Z"
          fill="#BDBDC0" />
        <path
          d="M153.6 119.467H85.333C80.62 119.467 76.8 115.646 76.8 110.934C76.8 106.222 80.621 102.401 85.333 102.401H153.6C158.313 102.401 162.133 106.222 162.133 110.934C162.133 115.646 158.313 119.467 153.6 119.467Z"
          fill="#7A7C82" />
        <path
          d="M153.6 153.6H85.333C80.62 153.6 76.8 149.779 76.8 145.067C76.8 140.354 80.621 136.534 85.333 136.534H153.6C158.313 136.534 162.133 140.355 162.133 145.067C162.133 149.779 158.313 153.6 153.6 153.6Z"
          fill="#7A7C82" />
        <path d="M273.066 256H238.933V349.867H273.066V256Z" fill="#FD5E95" />
        <path d="M307.2 256H273.067V349.867H307.2V256Z" fill="#45CAE0" />
        <path d="M238.933 256H204.8V349.867H238.933V256Z" fill="#FFE88A" />
      </svg>


    </div>

    <div class="reader reader__back">
      <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M494.482 481H17.5169C12.8128 481 9 477.177 9 472.462V370H503V472.462C503 477.177 499.186 481 494.482 481Z"
          fill="#4E5058" />
        <path
          d="M78.7949 395H424.206C430.168 395 435 393.134 435 390.833V382.5V370C432 370 426 370 426 370H78.7949C72.8333 370 68 370 68 370V382.5V390.833C68 393.134 72.8333 395 78.7949 395Z"
          fill="#7A7C82" />
        <path
          d="M30.334 463.867C27.978 463.867 26.067 461.957 26.067 459.6V370H9V472.4C9 477.113 12.821 480.933 17.533 480.933H495.4C500.113 480.933 503.933 477.112 503.933 472.4V463.867H30.334Z"
          fill="#383A43" />
      </svg>

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
  padding: 1rem;
  height: 100vh;
}

.reader {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  width: 40vw;
  max-width: 400px;
}

.reader svg {
  width: 100%;
  height: auto;
  display: block;
}

.reader.reader__back {
  z-index: 1;
  top: 2.5%;
}

.reader.reader__front {
  z-index: 3;
  top: 0;
}


.login-view__content {
  position: relative;
  z-index: 2;
  background: var(--white);
  color: var(--black);
  padding: 1.25rem;
  max-width: 250px;
  margin: 280px auto 0 auto;
  border-radius: 0 0 16px 16px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.18),
    0 4px 12px rgba(0, 0, 0, 0.1);

  animation: ejectCard 2s cubic-bezier(0.34, 1.4, 0.64, 1) both;
}

@media (max-width: 480px) {
  .login-view__content {
    margin-top: 300px;
    padding: 1.5rem 1.5rem 1.25rem;
  }

  .reader {
    width: 85vw;
  }
}

@media (max-width: 360px) {
  .login-view__content {
    margin-top: 220px;
    padding: 1rem 0.875rem 0.75rem;
    width: 250px;
  }

  .reader {
    width: 80vw;
  }
}

.login-view__content button {
  width: 100%;
}

.login-view__content h2 {
  text-align: center;
}

.login-view__content form {
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
    transform: translateY(-100%);
    opacity: 0;
  }

  40% {
    opacity: 1;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
