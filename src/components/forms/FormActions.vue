<script setup>
// Botões de ação do formulário — salvar (com estado de envio) e cancelar
import Button from '../ui/Button.vue'

// Botões de salvar e cancelar no final do formulário
defineProps({
  isSubmitting: {
    type: Boolean,
    default: false
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  submitText: {
    type: String,
    default: 'Salvar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  }
})

defineEmits(['cancel']);
</script>

<template>
  <div class="form-actions">
    <Button
      type="submit"
      :disabled="isSubmitting || isLoading"
      variant="primary"
    >
      {{ isSubmitting ? 'Salvando...' : submitText }}
    </Button>

    <Button
      type="button"
      @click="$emit('cancel')"
      variant="secondary"
    >
      {{ cancelText }}
    </Button>
  </div>
</template>

<style scoped>
.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
  justify-content: flex-end;
}


@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }


}
</style>
