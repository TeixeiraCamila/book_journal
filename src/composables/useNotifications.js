// Composable para notificações toast — abstrai vue-toastification com tipos (success/error/warning/info)
import { useToast } from 'vue-toastification';
import { TOAST_CONFIG } from '@/constants/toast';

export function use_notifications() {
  const toast = useToast();

  const add_notification = (message, type = 'info', options = {}) => {
    if (!toast) {
      return;
    }

    const toast_options = {
      ...TOAST_CONFIG,
      ...options,
    };

    switch (type) {
      case 'success':
        toast.success(message, toast_options);
        break;
      case 'error':
        toast.error(message, toast_options);
        break;
      case 'warning':
        toast.warning(message, toast_options);
        break;
      case 'info':
      default:
        toast.info(message, toast_options);
        break;
    }
  };

  const remove_notification = (id) => {
    if (toast && toast.dismiss) {
      toast.dismiss(id);
    }
  };

  return {
    add_notification,
    remove_notification,
  };
}
