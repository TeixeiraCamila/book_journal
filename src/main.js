// Ponto de entrada da aplicação — inicializa Vue 3 com Pinia, Router e Toast
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import './assets/main.css';

// vue-toastification: biblioteca de notificações toast
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { TOAST_CONFIG } from '@/constants/toast';

const app = createApp(App);

// Pinia: gerenciamento de estado reativo (stores)
app.use(createPinia());
// Vue Router: navegação SPA com lazy loading de rotas
app.use(router);

// Configuração do vue-toastification
app.use(Toast, TOAST_CONFIG);

app.mount('#app');
