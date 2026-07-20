<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
// Barra de filtros — busca por título e filtro por status com botão limpar
import { computed, ref } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { BOOK_STATUS_LABELS } from '@/constants/book'
import Button from '../ui/Button.vue'

const bookStore = useBookStore()
const localSearch = ref(bookStore.searchTerm)
const localStatus = ref(bookStore.filterStatus)

const statusOptions = computed(() => bookStore.statusOptions)

const handleSearch = () => {
  if (localSearch.value.trim() === bookStore.searchTerm) return
  bookStore.search(localSearch.value)
}

const handleFilterChange = () => {
  bookStore.filterByStatus(localStatus.value)
}

const clearFilters = () => {
  localSearch.value = ''
  localStatus.value = 'all'
  bookStore.search('')
  bookStore.filterByStatus('all')
}
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <input
        type="text"
        placeholder="Buscar por título..."
        v-model="localSearch"
        @keyup.enter="handleSearch"
        class="filters__input"
      />
      <Button @click="handleSearch" variant="primary">
        <span>Buscar</span>
      </Button>
    </div>

    <select v-model="localStatus" @change="handleFilterChange" class="filters__select">
      <option value="all">Todos os status</option>
      <option v-for="status in statusOptions" :key="status" :value="status">
        {{ BOOK_STATUS_LABELS[status] || status }}
      </option>
    </select>

    <Button
      v-if="bookStore.searchTerm || bookStore.filterStatus !== 'all'"
      @click="clearFilters"
      class="filters__clear-btn"
    >
      <span>Limpar filtros</span>
    </Button>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 249, 238, 0.95);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: var(--box-shadow);
  border-radius: 12px;
}

.filters__row {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  min-width: 200px;
}
.filters__row button {
  width: fit-content;
}
</style>
