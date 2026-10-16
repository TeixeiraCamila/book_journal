<script setup>
// Grid de livros com filtros, paginação e estados de loading/erro/vazio
import { computed, onMounted } from 'vue';
import { useBookStore } from '@/stores/bookStore';
import { DEFAULT_SEARCH_MODE } from '@/constants/book';
import BookCard from '@/components/books/BookCard/BookCard.vue';
import BookCardSkeleton from '@/components/ui/Skeleton/BookCardSkeleton.vue';
import Pagination from '@/components/navigation/Pagination.vue';
import Filters from '@/components/navigation/Filters.vue';
import StateHandler from '@/components/ui/StateHandler.vue';
import { useBookNavigation } from '@/composables/useBookNavigation';

const bookStore = useBookStore();
const { navigateToEdit } = useBookNavigation();

// Texto do estado vazio muda conforme há filtros ativos
const emptyText = computed(() =>
  bookStore.searchTerm || bookStore.filterStatus !== 'all'
    ? 'Tente ajustar seus filtros de busca'
    : 'Comece adicionando seu primeiro livro!',
);

/**
 * Carrega livros ao montar o componente
 */
onMounted(async () => {
  // Configura filtros iniciais
  bookStore.filterStatus = 'all';
  bookStore.searchTerm = '';
  bookStore.searchBy = DEFAULT_SEARCH_MODE;
  bookStore.searchToken += 1; // Invalida qualquer busca em voo ao trocar de tela

  // Busca opções do backend e livros
  await Promise.all([bookStore.fetchBookOptions(), bookStore.fetchBooks()]);
});
</script>

<template>
  <div class="book-list">
    <!-- Controles de Filtro -->
    <div class="book-list__controls">
      <Filters class="book-list__filters" />
    </div>

    <div class="book-list-content">
      <StateHandler
        :loading="bookStore.loadingStates.main && bookStore.allBooks.length === 0"
        :error="bookStore.hasError ? bookStore.error : false"
        :empty="bookStore.allBooks.length === 0"
        :empty-text="emptyText"
        @retry="bookStore.fetchBooks()"
      >
        <!-- Esqueleto de cards na primeira carga; paginação mantém a grade visível depois -->
        <template #loading>
          <div class="book-list__skeletons">
            <BookCardSkeleton v-for="n in bookStore.pagination.pageSize" :key="n" />
          </div>
        </template>

        <TransitionGroup
          name="book-list"
          tag="div"
          class="book-list__grid"
          :class="{ 'book-list__grid--loading': bookStore.loadingStates.main }"
        >
          <BookCard
            v-for="book in bookStore.allBooks"
            :key="book.id"
            :book="book"
            @edit="navigateToEdit($event.id)"
          />
        </TransitionGroup>

        <!-- Paginação -->
        <Pagination
          :book-count="bookStore.bookCount"
          :page-size="bookStore.pagination.pageSize"
          :has-previous="bookStore.hasPreviousPage"
          :has-next="bookStore.hasNextPage"
          @previous="bookStore.previousPage"
          @next="bookStore.nextPage"
          @change-size="bookStore.changePageSize"
        />
      </StateHandler>
    </div>
  </div>
</template>

<style>
.stack-view__card.stack-view__book-list {
  padding: 0;
}
</style>

<style scoped>
.book-list {
  display: flex;
  gap: 2rem;
  position: relative;
  height: 100%;
}
.book-list__details {
  position: absolute;
  top: 0;
  left: 200px;
  width: fit-content;
  height: 100%;
}

/* ===== ESTADOS (LOADING, ERROR, EMPTY) ===== */
.book-list-content {
  padding: 1rem 0;
  overflow: scroll;
}

/* Estado de Loading */
.book-list__skeletons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 3rem 1.5rem;
  flex: 1;
  margin-top: 2rem;
}

/* ===== GRID DE LIVROS ===== */
.book-list__grid {
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 3rem 2.5rem;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.book-list__grid--loading {
  opacity: 0.5;
  pointer-events: none;
}

/* ===== ANIMAÇÕES ===== */
.book-list-move,
.book-list-enter-active,
.book-list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.book-list-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.book-list-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

.book-list-leave-active {
  position: absolute;
}

/* ===== RESPONSIVIDADE ===== */

@media (max-width: 768px) {
  .book-list {
    gap: 1rem;
    flex-direction: column;
  }

  .filters {
    height: fit-content;
  }
}
</style>
