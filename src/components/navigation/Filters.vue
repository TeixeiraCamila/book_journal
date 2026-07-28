<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
// Barra de filtros — busca por título e filtro por status com botão limpar
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/stores/bookStore';
import { useUserStore } from '@/stores/userStore';
import { BOOK_STATUS_LABELS } from '@/constants/book';
import Button from '../ui/Button.vue';

const bookStore = useBookStore();
const userStore = useUserStore();
const router = useRouter();
const localSearch = ref(bookStore.searchTerm);
const localStatus = ref(bookStore.filterStatus);

const statusOptions = computed(() => bookStore.statusOptions);

const navigateToCreate = () => {
  router.push('/criar');
};

const handleSearch = () => {
  if (localSearch.value.trim() === bookStore.searchTerm) return;
  bookStore.search(localSearch.value);
};

const handleFilterChange = () => {
  bookStore.filterByStatus(localStatus.value);
};

const clearFilters = () => {
  localSearch.value = '';
  localStatus.value = 'all';
  bookStore.search('');
  bookStore.filterByStatus('all');
};
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
      <Button @click="handleSearch" variant="secondary"> Buscar </Button>
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
          variant="secondary"
        >
          Limpar filtros
        </Button>
      </div>
    </div>

    <div class="filters__row">
      <Button v-if="!userStore.isGuest" @click="navigateToCreate">
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
  padding: 1rem;
  position: sticky;
  top: 0;
  height: 80vh;
  justify-content: space-between;
  background-color: #e6dedc;
  background-image: linear-gradient(-90deg, #5a7da480 50%, transparent 50%),
    linear-gradient(#5a7da480 50%, transparent 50%);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}
.filters::after {
  content: '';
  position: absolute;
  top: 0;
  right: -15px;
  width: 50px;
  height: 100%;
  background: url('@/assets/images/cards/card_list/blue__lace.webp') repeat-y;
}
.filters__row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
  z-index: 1;
}

.filters__row button {
  width: 100%;
}
</style>
