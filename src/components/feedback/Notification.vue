<script setup>
import { computed } from 'vue'

import Button from '../ui/Button.vue';

defineProps({
  message: String,
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  show: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const icon = computed(() => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[props.type] || icons.info
});
</script>

<template>
  <Transition name="notification">
    <div
      v-if="show"
      class="notification"
      :class="`notification--${type}`"
      role="alert"
    >
      <span class="notification__icon">{{ icon }}</span>
      <span class="notification__message">{{ message }}</span>
      <Button @click="$emit('close')" class="notification__close-btn">×</Button>
    </div>
  </Transition>
</template>



<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
  z-index: 1000;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification--success { background: #d1fae5; color: #065f46; }
.notification--error { background: #fee2e2; color: #991b1b; }
.notification--warning { background: #fef3c7; color: #92400e; }
.notification--info { background: #dbeafe; color: #1e40af; }

.notification__close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
}

.notification__close-btn:hover {
  opacity: 1;
}

/* Animações */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
