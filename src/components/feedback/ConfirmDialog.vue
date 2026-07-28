<!-- eslint-disable no-unused-vars -->
<script setup>
// Diálogo de confirmação modal — usado para deletar livros com confirmação do usuário
import { ref } from 'vue'
import { useNotifications } from '@/composables/useNotifications'
import Button from '../ui/Button.vue'

const props = defineProps({
  title: { type: String, default: 'Confirmar ação' },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'Confirmar' },
  onConfirm: { type: Function, default: null },
})

const emit = defineEmits(['confirm', 'cancel'])

const { addNotification } = useNotifications()
const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const handleConfirm = async () => {
  try {
    if (props.onConfirm) {
      await props.onConfirm()
      addNotification('Livro deletado com sucesso!')
      close()
    }
  } catch (error) {
    addNotification('Erro ado deletar o livro', error)
  }
}

const handleCancel = () => {
  emit('cancel')
  close()
}

// Expõe métodos para componente pai
defineExpose({
  open,
  close,
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="confirm-dialog__overlay" @click="handleCancel">
        <div class="confirm-dialog__content" @click.stop>
          <div class="confirm-dialog__header">
            <h3 class="confirm-dialog__title">{{ title }}</h3>
          </div>

          <div class="confirm-dialog__body">
            <p>{{ message }}</p>
          </div>

          <div class="confirm-dialog__footer">
            <Button @click="handleCancel" variant="secondary">Cancelar</Button>
            <Button @click="handleConfirm" variant="danger">
              {{ confirmText }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>



<style scoped>
.confirm-dialog__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.confirm-dialog__content {
  background: var(--bg);
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 28rem;
  width: 90%;
  box-shadow: var(--shadow-lg);
}

.confirm-dialog__header {
  margin-bottom: 1rem;
}

.confirm-dialog__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.confirm-dialog__body {
  margin-bottom: 1.5rem;
  color: var(--color-text-soft);
  line-height: 1.6;
}

.confirm-dialog__footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Animação de entrada */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
