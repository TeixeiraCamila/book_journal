<script setup>
// Grid de livros com filtros, paginação e estados de loading/erro/vazio
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { use_book_store } from '@/stores/bookStore';
import { DEFAULT_SEARCH_MODE } from '@/constants/book';
import BookCard from '@/components/books/BookCard/BookCard.vue';
import BookCardSkeleton from '@/components/ui/Skeleton/BookCardSkeleton.vue';
import Pagination from '@/components/navigation/Pagination.vue';
import Filters from '@/components/navigation/Filters.vue';
import Button from '@/components/ui/Button.vue';
const bookStore = use_book_store();
const router = useRouter();

/**
 * Carrega livros ao montar o componente
 */
onMounted(async () => {
  // Configura filtros iniciais
  bookStore.filter_status = 'all';
  bookStore.search_term = '';
  bookStore.search_by = DEFAULT_SEARCH_MODE;
  bookStore.search_token += 1; // Invalida qualquer busca em voo ao trocar de tela

  // Busca opções do backend e livros
  await Promise.all([bookStore.fetch_book_options(), bookStore.fetch_books()]);
});

/**
 * Redireciona para página de edição
 */
const handle_edit_book = (book) => {
  router.push(`/editar/${book.id}`);
};
</script>

<template>
  <div class="book-list">
    <!-- Controles de Filtro -->
    <div class="book-list__controls">
      <Filters class="book-list__filters" />
    </div>

    <div class="bool-list-content">
      <!-- Estado de Loading (só na primeira carga; paginação mantém a grade visível) -->
      <div
        v-if="bookStore.loading_states.main && bookStore.all_books.length === 0"
        class="book-list__skeletons"
      >
        <BookCardSkeleton v-for="n in bookStore.pagination.page_size" :key="n" />
      </div>

      <!-- Estado de Erro -->
      <div v-else-if="bookStore.has_error" class="book-list__state book-list__state--error">
        <div class="book-list__error-icon">⚠️</div>
        <p class="book-list__error-message">{{ bookStore.error }}</p>
        <Button @click="bookStore.fetch_books()"> Tentar Novamente </Button>
      </div>

      <!-- Estado Vazio -->
      <div v-else-if="bookStore.all_books.length === 0" class="book-list__state">
        <div class="book-list__empty-icon">📚</div>
        <h2 class="book-list__empty-title">Nenhum livro encontrado</h2>
        <p class="book-list__empty-text">
          {{
            bookStore.search_term || bookStore.filter_status !== 'all'
              ? 'Tente ajustar seus filtros de busca'
              : 'Comece adicionando seu primeiro livro!'
          }}
        </p>
      </div>

      <!-- Grid de Livros -->
      <template v-else>
        <TransitionGroup
          name="book-list"
          tag="div"
          class="book-list__grid"
          :class="{ 'book-list__grid--loading': bookStore.loading_states.main }"
        >
          <BookCard
            v-for="book in bookStore.all_books"
            :key="book.id"
            :book="book"
            @edit="handle_edit_book"
          />
        </TransitionGroup>

        <!-- Paginação -->
        <Pagination
          :book-count="bookStore.book_count"
          :page-size="bookStore.pagination.page_size"
          :has-previous="bookStore.has_previous_page"
          :has-next="bookStore.has_next_page"
          @previous="bookStore.previous_page"
          @next="bookStore.next_page"
          @change-size="bookStore.change_page_size"
        />
      </template>
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
}
.book-list__details {
  position: absolute;
  top: 0;
  left: 200px;
  width: fit-content;
  height: 100%;
}

/* ===== ESTADOS (LOADING, ERROR, EMPTY) ===== */
.bool-list-content {
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
.book-list__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 4rem 2rem;
}

/* Estado de Loading */
.book-list__skeletons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 3rem 1.5rem;
  flex: 1;
  margin-top: 2rem;
}

/* Estado de Erro */
.book-list__state--error {
  border-radius: var(--radius);
  width: 100%;
  margin: 0 auto;
}

.book-list__error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.book-list__error-message {
  font-size: 1.125rem;
  color: var(--danger);
  margin-bottom: 1.5rem;
}

/* Estado Vazio */
.book-list__empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.book-list__empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--black);
  margin-bottom: 0.5rem;
}

.book-list__empty-text {
  color: var(--white);
  max-width: 400px;
  line-height: 1.6;
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

  .book-list__state {
    padding: 2rem 1rem;
  }
}
</style>
