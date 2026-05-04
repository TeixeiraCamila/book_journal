import { useToast } from 'vue-toastification'

export function useNotifications() {
  const toast = useToast()

  const addNotification = (message, type = 'info', options = {}) => {
    if (!toast) {
      return
    }

    const toastOptions = {
      timeout: 3000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      progress: true,
      ...options,
    }

    switch (type) {
      case 'success':
        toast.success(message, toastOptions)
        break
      case 'error':
        toast.error(message, toastOptions)
        break
      case 'warning':
        toast.warning(message, toastOptions)
        break
      case 'info':
      default:
        toast.info(message, toastOptions)
        break
    }
  }

  const removeNotification = (id) => {
    if (toast && toast.dismiss) {
      toast.dismiss(id)
    }
  }

  return {
    addNotification,
    removeNotification,
  }
}
