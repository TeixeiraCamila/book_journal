<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
// Barra de filtros — busca por título/autor/gênero e status em radio, com botão limpar
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useBookStore } from '@/stores/bookStore';
import { useUserStore } from '@/stores/userStore';
import {
  BOOK_SEARCH_MODES,
  BOOK_SEARCH_PLACEHOLDERS,
  BOOK_STATUS_LABELS,
  DEFAULT_SEARCH_MODE,
  SEARCH_DEBOUNCE_MS,
} from '@/constants/book';
import Button from '@/components/ui/Button.vue';

const bookStore = useBookStore();
const userStore = useUserStore();
const router = useRouter();
const localSearch = ref(bookStore.searchTerm);
const localSearchBy = ref(bookStore.searchBy);
const localStatus = ref(bookStore.filterStatus);

let searchTimer = null;

const statusOptions = computed(() => bookStore.statusOptions);

// "Todos" entra no mesmo grupo dos demais, mantendo o radio como seletor único
const statusRadioOptions = computed(() => [
  { value: 'all', label: 'Todos' },
  ...statusOptions.value.map((status) => ({
    value: status,
    label: BOOK_STATUS_LABELS[status] || status,
  })),
]);

const searchPlaceholder = computed(
  () => BOOK_SEARCH_PLACEHOLDERS[localSearchBy.value] || BOOK_SEARCH_PLACEHOLDERS.title,
);

const hasActiveFilters = computed(() => bookStore.searchTerm || bookStore.filterStatus !== 'all');

const navigateToCreate = () => {
  router.push('/criar');
};

const handleSearch = () => {
  if (localSearch.value.trim() === bookStore.searchTerm) return;
  bookStore.search(localSearch.value);
};

const handleSearchByChange = () => {
  bookStore.setSearchBy(localSearchBy.value);
};

const handleFilterChange = () => {
  bookStore.filterByStatus(localStatus.value);
};

const clearFilters = () => {
  clearTimeout(searchTimer);
  localSearch.value = '';
  localSearchBy.value = DEFAULT_SEARCH_MODE;
  localStatus.value = 'all';
  bookStore.search('');
  bookStore.setSearchBy(DEFAULT_SEARCH_MODE);
  bookStore.filterByStatus('all');
};

// Debounce manual: @vueuse/core não é dependência direta (só @vueuse/motion),
// então watchDebounced não está disponível aqui.
watch(localSearch, () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(handleSearch, SEARCH_DEBOUNCE_MS);
});

onUnmounted(() => clearTimeout(searchTimer));
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <input
        type="text"
        :placeholder="searchPlaceholder"
        v-model="localSearch"
        @keyup.enter="handleSearch"
        class="filters__input"
      />

      <div class="select_wrapper">
        <select v-model="localSearchBy" @change="handleSearchByChange">
          <option v-for="mode in BOOK_SEARCH_MODES" :key="mode.value" :value="mode.value">
            {{ mode.label }}
          </option>
        </select>
      </div>

      <fieldset class="filters__group">
        <legend class="filters__legend">Status</legend>
        <label v-for="option in statusRadioOptions" :key="option.value" class="filters__option">
          <input
            type="radio"
            class="filters__radio"
            name="book-status"
            :value="option.value"
            v-model="localStatus"
            @change="handleFilterChange"
          />
          <span>{{ option.label }}</span>
        </label>
      </fieldset>

      <Button v-if="hasActiveFilters" @click="clearFilters" variant="secondary">
        Limpar filtros
      </Button>
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
  justify-content: space-between;
  padding: 1rem;
  position: sticky;
  top: 0;
  /* min-height em vez de height: o grupo de radios cresce com as opções de status */
  min-height: 80vh;
  gap: 1.5rem;
  background-color: #e6dedc;
  background-image:
    linear-gradient(-90deg, #5a7da480 50%, transparent 50%),
    linear-gradient(#5a7da480 50%, transparent 50%);
  background-size: 20px 20px;
  background-position:
    0 0,
    10px 10px;
}
.filters::after {
  content: '';
  position: absolute;
  top: 0;
  right: -45px;
  width: 50px;
  height: 100%;
  background: url('@/assets/images/cards/card_list/blue__lace.webp') repeat-y;
}
.filters__row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
  z-index: 1;
}

.filters__row button {
  width: 100%;
}

/* ===== STATUS (RADIOS) ===== */
.filters__group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  border: none;
  padding: 0;
  margin: 0;
}
.filters__legend {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0;
  margin-bottom: 0.2rem;
  border-bottom: 3px solid;
  width: 100%;
}
.filters__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 12px;
  cursor: pointer;
}

/* O reset global aplica appearance:none, height:40px e width:100% a todo input,
   o que apagaria o radio nativo — aqui o desenho volta a ser o do browser. */
.filters__radio {
  appearance: auto;
  -webkit-appearance: radio;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  background: transparent;
  box-shadow: none;
  flex-shrink: 0;
}
.filters__radio:hover,
.filters__radio:active {
  transform: none;
  box-shadow: none;
}
</style>
