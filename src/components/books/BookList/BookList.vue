<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookStore } from '@/stores/bookStore'
import BookCard from '@/components/books/BookCard/BookCard.vue'
import BookCardSkeleton from '@/components/ui/Skeleton/BookCardSkeleton.vue'
import Pagination from '@/components/navigation/Pagination.vue'
import Filters from '@/components/navigation/Filters.vue'
import Button from '@/components/ui/Button.vue'
const bookStore = useBookStore()
const router = useRouter()

/**
 * Carrega livros ao montar o componente
 */
onMounted(async () => {
  // Configura filtros iniciais
  bookStore.filterStatus = 'all'
  bookStore.searchTerm = ''

  // Busca opções do backend e livros
  await Promise.all([
    bookStore.fetchBookOptions(),
    bookStore.fetchBooks(),
  ])
})

/**
 * Redireciona para página de edição
 */
const handleEditBook = (book) => {
  router.push(`/editar/${book.id}`)
}
</script>

<template>
  <div class="book-list">
    <!-- Controles de Filtro -->
    <div class="book-list__controls">
      <Filters class="book-list__filters" />
    </div>

    <!-- Estado de Loading -->
    <div v-if="bookStore.loadingStates.main" class="book-list__skeletons">
      <BookCardSkeleton v-for="n in 12" :key="n" />
    </div>

    <!-- Estado de Erro -->
    <div v-else-if="bookStore.hasError" class="book-list__state book-list__state--error">
      <div class="book-list__error-icon">⚠️</div>
      <p class="book-list__error-message">{{ bookStore.error }}</p>
      <Button class="book-list__retry-btn" @click="bookStore.fetchBooks()">
        Tentar Novamente
      </Button>
    </div>

    <!-- Estado Vazio -->
    <div v-else-if="bookStore.allBooks.length === 0" class="book-list__state">
      <div class="book-list__empty-icon">📚</div>
      <h2 class="book-list__empty-title">Nenhum livro encontrado</h2>
      <p class="book-list__empty-text">
        {{
          bookStore.searchTerm || bookStore.filterStatus !== 'all'
            ? 'Tente ajustar seus filtros de busca'
            : 'Comece adicionando seu primeiro livro!'
        }}
      </p>
    </div>

    <!-- Grid de Livros -->
    <template v-else>
      <TransitionGroup name="book-list" tag="div" class="book-list__grid">
        <BookCard
          v-for="book in bookStore.allBooks"
          :key="book.id"
          :book="book"
          @edit="handleEditBook"
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
    </template>
  </div>
</template>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.book-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ===== CONTROLES ===== */
.book-list__controls {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 249, 238, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ===== ESTADOS (LOADING, ERROR, EMPTY) ===== */
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

.book-list__spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Estado de Erro */
.book-list__state--error {
  border-radius: 12px;
  width: 100%;
  margin: 0 auto;
}

.book-list__error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.book-list__error-message {
  font-size: 1.125rem;
  color: #991b1b;
  margin-bottom: 1.5rem;
}

.book-list__retry-btn {
  padding: 0.75rem 2rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.book-list__retry-btn:hover {
  background: var(--accent2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(218, 147, 143, 0.3);
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
  color: var(--muted);
  max-width: 400px;
  line-height: 1.6;
}

/* ===== GRID DE LIVROS ===== */
.book-list__grid {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 3rem 1.5rem;
  /* display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 3rem 1.5rem;
  flex: 1; */
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
@media (max-width: 1024px) {
  .book-list__grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 2rem 1rem;
  }
}

@media (max-width: 768px) {
  .book-list {
    gap: 1rem;
  }

  .book-list__grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1.5rem 0.75rem;
  }

  .book-list__state {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .book-list__grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem 0.5rem;
  }
}
</style>
