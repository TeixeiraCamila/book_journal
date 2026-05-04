<script setup>
import { defineEmits } from 'vue'
import Button from '../ui/Button.vue'

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
      class="form-actions__btn form-actions__btn--primary"
    >
      {{ isSubmitting ? 'Salvando...' : submitText }}
    </Button>

    <Button
      type="button"
      @click="$emit('cancel')"
      class="form-actions__btn form-actions__btn--secondary"
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

.form-actions__btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.form-actions__btn--primary {
  background: var(--accent);
  color: white;
  box-shadow: 0 2px 4px rgba(218, 147, 143, 0.2);
}

.form-actions__btn--primary:hover:not(:disabled) {
  background: var(--accent2);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(218, 147, 143, 0.3);
}

.form-actions__btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-actions__btn--secondary {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.form-actions__btn--secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }

  .form-actions__btn {
    width: 100%;
  }
}
</style>
