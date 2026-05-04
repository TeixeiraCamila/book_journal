<script setup>
import { ref } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import Button from '../ui/Button.vue'

const bookStore = useBookStore()
const localSearch = ref(bookStore.searchTerm)
const localStatus = ref(bookStore.filterStatus)

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
  bookStore.searchTerm = ''
  bookStore.filterStatus = 'all'
  bookStore.fetchBooks()
};
</script>

<template>
  <div class="filters">
    <div class="filters__search-box ">
      <div class="input_wrapper">
        <input type="text" placeholder="Buscar por título ou autor..." v-model="localSearch" @keyup.enter="handleSearch"
          class="filters__search-input" />
      </div>
      <Button @click="handleSearch" variant="primary">
        <span> Buscar </span>
      </Button>
    </div>

    <div class="filters__filter-status">
      <div class="select_wrapper">
        <select v-model="localStatus" @change="handleFilterChange"
          class="filters__status-select filters__select--primary">
          <option value="all">Todos os status</option>
          <option value="Reading">Lendo</option>
          <option value="Read">Completo</option>
          <option value="To be read">Para Ler</option>
          <option value="DNF">Abondonados</option>
        </select>
      </div>
    </div>

    <Button v-if="bookStore.searchTerm || bookStore.filterStatus !== 'all'" @click="clearFilters"
      class="filters__clear-btn filters__btn--primary">
      <span>Limpar filtros</span>
    </Button>
  </div>
</template>

<style scoped>
.filters {
  background: transparent;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: var(--box-shadow);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 249, 238, 0.95);
  backdrop-filter: blur(4px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.filters__search-box {
  flex: 1;
  display: flex;
  gap: 0.5rem;
}

.filters__search-input {
  flex: 1;
}

@media (min-width: 640px) {
  .filters {
    flex-direction: row;
  }
}
</style>
