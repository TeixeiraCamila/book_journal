<script setup>
import Button from '../ui/Button.vue'
const props = defineProps({
  notifications: {
    type: Array,
    required: true
  }
})

const removeNotification = (id) => {
  props.notifications.splice(props.notifications.findIndex(n => n.id === id), 1)
}
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="toast"
        :class="`toast--${notification.type}`"
        role="alert"
      >
        <span class="toast__icon">{{ notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : notification.type === 'warning' ? '⚠️' : 'ℹ️' }}</span>
        <span class="toast__message">{{ notification.message }}</span>
        <Button @click="removeNotification(notification.id)" class="toast__close">×</Button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1500;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.toast {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast--success { border-left: 4px solid #10b981; }
.toast--error { border-left: 4px solid #ef4444; }
.toast--warning { border-left: 4px solid #f59e0b; }
.toast--info { border-left: 4px solid #3b82f6; }

.toast__icon {
  font-size: 18px;
  flex-shrink: 0;
}

.toast__message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  color: #111827;
}

.toast__close {
  background: none;
  border: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.toast__close:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Animações */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Responsivo */
@media (max-width: 640px) {
  .toast-container {
    right: 16px;
    left: 16px;
    max-width: none;
  }

  .toast {
    min-width: auto;
    width: 100%;
  }
}
</style>
