<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
// Paginação baseada em cursor — botões anterior/próximo e seletor de itens por página
import { defineEmits } from 'vue'
import Button from '../ui/Button.vue'

defineProps({
  bookCount: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  hasPrevious: { type: Boolean, required: true },
  hasNext: { type: Boolean, required: true },
})

defineEmits(['previous', 'next', 'changeSize'])

const selects = [20, 4, 8, 12, 18, 24, 30]
</script>
<template>
  <div class="pagination">
    <div class="pagination__page-size-selector">
      <label>Itens por página:</label>
      <div class="select_wrapper">
        <select
          name="page-size"
          id="page-size"
          :value="pageSize"
          @change="$emit('changeSize', $event.target.value)"
        >
          <option v-for="size in selects" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>
    <div class="pagination__controls">
      <Button @click="$emit('previous')" :disabled="!hasPrevious">
        <span>← Anterior</span>
      </Button>

      <Button @click="$emit('next')" :disabled="!hasNext">
        <span>Próximo →</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  background: transparent;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: var(--box-shadow);
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 1rem;
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
}
</style>
