// Ponto de entrada da aplicação — inicializa Vue 3 com Pinia, Router e Toast
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// vue-toastification: biblioteca de notificações toast
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const app = createApp(App)

// Pinia: gerenciamento de estado reativo (stores)
app.use(createPinia())
// Vue Router: navegação SPA com lazy loading de rotas
app.use(router)

// Configuração do vue-toastification
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  progress: true,
  icon: true
})

app.mount('#app')
