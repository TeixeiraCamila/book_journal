<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
// Barra de filtros — busca por título e filtro por status com botão limpar
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { use_book_store } from '@/stores/bookStore';
import { use_user_store } from '@/stores/userStore';
import { BOOK_STATUS_LABELS } from '@/constants/book';
import Button from '@/components/ui/Button.vue';

const bookStore = use_book_store();
const userStore = use_user_store();
const router = useRouter();
const local_search = ref(bookStore.search_term);
const local_status = ref(bookStore.filter_status);

const status_options = computed(() => bookStore.status_options);

const navigate_to_create = () => {
  router.push('/criar');
};

const handle_search = () => {
  if (local_search.value.trim() === bookStore.search_term) return;
  bookStore.search(local_search.value);
};

const handle_filter_change = () => {
  bookStore.filter_by_status(local_status.value);
};

const clear_filters = () => {
  local_search.value = '';
  local_status.value = 'all';
  bookStore.search('');
  bookStore.filter_by_status('all');
};
</script>

<template>
  <div class="filters">
    <div class="filters__row">
      <input
        type="text"
        placeholder="Buscar por título..."
        v-model="local_search"
        @keyup.enter="handle_search"
        class="filters__input"
      />
      <Button @click="handle_search" variant="secondary"> Buscar </Button>
      <div class="select_wrapper">
        <select v-model="local_status" @change="handle_filter_change">
          <option value="all">Todos os status</option>
          <option v-for="status in status_options" :key="status" :value="status">
            {{ BOOK_STATUS_LABELS[status] || status }}
          </option>
        </select>

        <Button
          v-if="bookStore.search_term || bookStore.filter_status !== 'all'"
          @click="clear_filters"
          variant="secondary"
        >
          Limpar filtros
        </Button>
      </div>
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
  padding: 1rem;
  position: sticky;
  top: 0;
  height: 80vh;
  justify-content: space-between;
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
  gap: 0.5rem;
  min-width: 200px;
  z-index: 1;
}

.filters__row button {
  width: 100%;
}
</style>
