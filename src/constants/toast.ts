// Constantes de configuração do vue-toastification
// Compartilhada entre main.js e useNotifications.js
import { POSITION } from 'vue-toastification';
import type { PluginOptions } from 'vue-toastification';

export const TOAST_CONFIG: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  icon: true,
};
