<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
// Barra de filtros — busca por título/autor/gênero e status em radio, com botão limpar
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { use_book_store } from '@/stores/bookStore';
import { use_user_store } from '@/stores/userStore';
import {
  BOOK_SEARCH_MODES,
  BOOK_SEARCH_PLACEHOLDERS,
  BOOK_STATUS_LABELS,
  DEFAULT_SEARCH_MODE,
  SEARCH_DEBOUNCE_MS,
} from '@/constants/book';
import Button from '@/components/ui/Button.vue';

const bookStore = use_book_store();
const userStore = use_user_store();
const router = useRouter();
const local_search = ref(bookStore.search_term);
const local_search_by = ref(bookStore.search_by);
const local_status = ref(bookStore.filter_status);

let search_timer = null;

const status_options = computed(() => bookStore.status_options);

// "Todos" entra no mesmo grupo dos demais, mantendo o radio como seletor único
const status_radio_options = computed(() => [
  { value: 'all', label: 'Todos' },
  ...status_options.value.map((status) => ({
    value: status,
    label: BOOK_STATUS_LABELS[status] || status,
  })),
]);

const search_placeholder = computed(
  () => BOOK_SEARCH_PLACEHOLDERS[local_search_by.value] || BOOK_SEARCH_PLACEHOLDERS.title,
);

const has_active_filters = computed(
  () => bookStore.search_term || bookStore.filter_status !== 'all',
);

const navigate_to_create = () => {
  router.push('/criar');
};

const handle_search = () => {
  if (local_search.value.trim() === bookStore.search_term) return;
  bookStore.search(local_search.value);
};

const handle_search_by_change = () => {
  bookStore.set_search_by(local_search_by.value);
};

const handle_filter_change = () => {
  bookStore.filter_by_status(local_status.value);
};

const clear_filters = () => {
  clearTimeout(search_timer);
  local_search.value = '';
  local_search_by.value = DEFAULT_SEARCH_MODE;
  local_status.value = 'all';
  bookStore.search('');
  bookStore.set_search_by(DEFAULT_SEARCH_MODE);
  bookStore.filter_by_status('all');
};

// Debounce manual: @vueuse/core não é dependência direta (só @vueuse/motion),
// então watchDebounced não está disponível aqui.
watch(local_search, () => {
  clearTimeout(search_timer);
  search_timer = setTimeout(handle_search, SEARCH_DEBOUNCE_MS);
});

onUnmounted(() => clearTimeout(search_timer));
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <input
        type="text"
        :placeholder="search_placeholder"
        v-model="local_search"
        @keyup.enter="handle_search"
        class="filters__input"
      />

      <div class="select_wrapper">
        <select v-model="local_search_by" @change="handle_search_by_change">
          <option v-for="mode in BOOK_SEARCH_MODES" :key="mode.value" :value="mode.value">
            {{ mode.label }}
          </option>
        </select>
      </div>

      <fieldset class="filters__group">
        <legend class="filters__legend">Status</legend>
        <label v-for="option in status_radio_options" :key="option.value" class="filters__option">
          <input
            type="radio"
            class="filters__radio"
            name="book-status"
            :value="option.value"
            v-model="local_status"
            @change="handle_filter_change"
          />
          <span>{{ option.label }}</span>
        </label>
      </fieldset>

      <Button v-if="has_active_filters" @click="clear_filters" variant="secondary">
        Limpar filtros
      </Button>
    </div>

    <div class="filters__row">
      <Button v-if="!userStore.is_guest" @click="navigate_to_create">
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
