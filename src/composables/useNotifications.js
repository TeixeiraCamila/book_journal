// Composable para notificações toast — abstrai vue-toastification com tipos (success/error/warning/info)
import { useToast } from 'vue-toastification';
import { TOAST_CONFIG } from '@/constants/toast';

export function useNotifications() {
  const toast = useToast();

  const addNotification = (message, type = 'info', options = {}) => {
    if (!toast) {
      return;
    }

    const toastOptions = {
      ...TOAST_CONFIG,
      ...options,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
      default:
        toast.info(message, toastOptions);
        break;
    }
  };

  const removeNotification = (id) => {
    if (toast && toast.dismiss) {
      toast.dismiss(id);
    }
  };

  return {
    addNotification,
    removeNotification,
  };
}
