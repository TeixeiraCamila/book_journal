<script setup>
import { defineEmits } from 'vue'
import Button from '../ui/Button.vue'

defineProps({
  bookCount: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  hasPrevious: { type: Boolean, required: true },
  hasNext: { type: Boolean, required: true },
})

defineEmits(['previous', 'next', 'changeSize']);

const selects = [4, 8, 12, 18, 24, 30];
</script>
<template>
  <div class="pagination">
    <div class="pagination__info">
      Mostrando {{ bookCount }} {{ bookCount === 1 ? 'livro' : 'livros' }}
    </div>

    <div class="pagination__controls">
      <Button @click="$emit('previous')" :disabled="!hasPrevious">
        <span>← Anterior</span>
      </Button>

      <Button @click="$emit('next')" :disabled="!hasNext">
        <span>Próximo →</span>
      </Button>
    </div>

    <div class="pagination__page-size-selector">
      <label>Itens por página:</label>
      <div class="select_wrapper">
        <select name="page-size" id="page-size" class="pagination__select--primary"
          @change="$emit('changeSize', $event.target.value)">
          <option v-for="size in selects" :key="size" :value="size" :selected="size === pageSize">
            {{ size }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>



<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  border: 1px solid #e5e7eb;
  background: transparent;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: var(--box-shadow);
}

.pagination__info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination__btn--primary {
  padding: 0.5rem 1.5rem;
  border: 1px solid #d1d5db;
  background: var(--white);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination__btn--primary:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: var(--accent);
  transform: translateY(-1px);
}

.pagination__btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 640px) {
  .pagination {
    padding: 1rem 0.75rem;
  }

  .pagination__controls {
    width: 100%;
    justify-content: space-between;
  }

  .pagination__btn--primary {
    flex: 1;
    padding: 0.625rem 1rem;
  }
}
</style>
