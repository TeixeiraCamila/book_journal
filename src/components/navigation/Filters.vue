<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
// Barra de filtros — busca por título e filtro por status com botão limpar
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/stores/bookStore'
import { useUserStore } from '@/stores/userStore'
import { BOOK_STATUS_LABELS } from '@/constants/book'
import Button from '../ui/Button.vue'

const bookStore = useBookStore()
const userStore = useUserStore()
const router = useRouter()
const localSearch = ref(bookStore.searchTerm)
const localStatus = ref(bookStore.filterStatus)

const statusOptions = computed(() => bookStore.statusOptions)

const navigateToCreate = () => {
  router.push('/criar')
}

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

    <div class="filters__row">
      <div class="select_wrapper">
        <select v-model="localStatus" @change="handleFilterChange">
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

      <Button v-if="!userStore.isGuest" class="filters__add-btn" @click="navigateToCreate">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 4V20M4 12H20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Adicionar Livro
      </Button>
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: 12px;
  width: calc(100% - 3rem);
  padding: 1rem;
  height: 80vh;
}

.filters__row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
}

.filters__row button {
  width: 100%;
}

.filters__add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--accent3);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.filters__add-btn:hover {
  background: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(218, 147, 143, 0.3);
}
</style>
