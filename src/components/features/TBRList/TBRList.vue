<script setup>
// Lista "To Be Read" — exibe livros pendentes em formato de selos (stamps) com rotação alternada
import { useRouter } from 'vue-router'
import { useBookStore } from '@/stores/bookStore'
import { onMounted, computed } from 'vue'
import { BOOK_STATUS_MAP } from '@/constants/book'
import Button from '@/components/ui/Button.vue'

const router = useRouter()
const bookStore = useBookStore()


const handleRetry = async () => {
  await bookStore.fetchBooksByStatus(undefined, BOOK_STATUS_MAP.TO_BE_READ)
}


const showEmptyState = computed(() => {
  return !bookStore.loadingStates.tbr &&
    bookStore.bookLists.tbr.length === 0 &&
    !bookStore.hasError
});


const navigateToEdit = (bookId) => {
  router.push(`/editar/${bookId}`)
};
</script>

<template>
  <div class="tbr-list">

    <header class="tbr-list__header">
      <h1 class="tbr-list__title">To Be Read</h1>
      <p class="tbr-list__subtitle">
        {{ bookStore.tbrCount }} {{ bookStore.tbrCount === 1 ? 'livro' : 'livros' }} para ler
      </p>
    </header>


    <div v-if="bookStore.hasError && !bookStore.loadingStates.tbr" class="tbr-list__error">
      <div class="tbr-list__error-icon">⚠️</div>
      <p class="tbr-list__error-message">{{ bookStore.error }}</p>
      <Button class="tbr-list__retry-btn" @click="handleRetry">
        Tentar Novamente
      </Button>
    </div>


    <div v-else-if="bookStore.loadingStates.tbr" class="tbr-list__loading">
      <div class="tbr-list__spinner"></div>
      <p>Carregando livros...</p>
    </div>


    <div v-else-if="showEmptyState" class="tbr-list__empty">
      <div class="tbr-list__empty-icon">📚</div>
      <h2 class="tbr-list__empty-title">Lista vazia</h2>
      <p class="tbr-list__empty-text">
        Adicione livros com o status "To be read" para vê-los aqui!
      </p>
    </div>


    <TransitionGroup v-else name="stamp" tag="div" class="tbr-list__grid">
      <div v-for="(book, index) in bookStore.bookLists.tbr" :key="book.id" class="stamp-wrapper"
        :style="{ transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)` }">
        <article class="stamp"  @click="navigateToEdit(book.id)">
          <div class="stamp__inner">
            <div class="stamp__image-container">
              <img v-if="book.cover?.[0]" :src="book.cover[0]" :alt="`Capa do livro ${book.name}`" class="stamp__image"
                loading="lazy" />
              <div v-else class="stamp__placeholder" aria-label="Sem capa disponível">
                📖
              </div>
              <div class="stamp__overlay" aria-hidden="true"></div>
            </div>

            <div class="stamp__details">
              <h3 class="stamp__title">{{ book.name }}</h3>
              <p v-if="book.author?.length" class="stamp__author">
                {{ book.author.join(', ') }}
              </p>
              <p v-else class="stamp__author">Autor desconhecido</p>
            </div>
          </div>
        </article>
      </div>
    </TransitionGroup>
  </div>  
</template>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
.tbr-list {
  min-height: 100%;
}

/* ===== HEADER ===== */
.tbr-list__header {
  text-align: center;
  background-image: url('../assets/images/cards/card_03_stats/tape-title.webp');
  background-repeat: no-repeat;
  background-position: center;
  background-origin: content-box;
  width: fit-content;
  padding: 2rem 2rem 1.5rem 1.5rem;
  margin: 0 auto;
}

.tbr-list__title {
  font-size: 2.5rem;
  color: var(--white);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.tbr-list__subtitle {
  color: var(--white);
}

/* ===== ESTADOS (ERROR, LOADING, EMPTY) ===== */
.tbr-list__error,
.tbr-list__loading,
.tbr-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #4a3f35;
}

/* Estado de Erro */
.tbr-list__error {
  background: rgba(239, 68, 68, 0.1);
  border-radius: 12px;
  margin: 2rem;
}

.tbr-list__error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tbr-list__error-message {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  color: #991b1b;
}

.tbr-list__retry-btn {
  padding: 0.75rem 2rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tbr-list__retry-btn:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Estado de Loading */
.tbr-list__spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top-color: #8b4513;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Estado Vazio */
.tbr-list__empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.tbr-list__empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.tbr-list__empty-text {
  color: #8c7b6a;
  max-width: 400px;
}

/* ===== GRID DE LIVROS ===== */
.tbr-list__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7rem;
  margin-top: 2rem;
}

/* ===== STAMP CARD ===== */
.stamp-wrapper {
  transition: all 0.3s ease;
  filter: drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.2));
}

.stamp-wrapper:hover {
  transform: scale(1.1) rotate(0deg) !important;
  z-index: 10;
}

.stamp {
  background: #fff;
  padding: 12px;
  position: relative;
  width: 180px;
  margin: 0 auto;
}

/* Efeito de borda serrilhada */
.stamp::after {
  content: '';
  position: absolute;
  top: -12px;
  left: -8px;
  right: -12px;
  bottom: -9px;
  background-image: radial-gradient(circle at 9px 9px, transparent 6px, #fff 7px);
  background-size: 20px 20px;
  z-index: -1;
}

.stamp__inner {
  border: 1px solid #ddd;
  padding: 4px;
  background: #f9f9f9;
}

.stamp__image-container {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #eee;
}

.stamp__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: sepia(0.2) contrast(1.1);
}

.stamp__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 3rem;
  background: #e5e5e5;
}

.stamp__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  pointer-events: none;
}

.stamp__details {
  padding: 10px 2px;
  text-align: center;
}

.stamp__title {
  font-size: 0.85rem;
  font-weight: bold;
  color: #333;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stamp__author {
  font-size: 0.7rem;
  color: #777;
  margin: 0;
}

/* ===== ANIMAÇÕES ===== */
.stamp-move,
.stamp-enter-active,
.stamp-leave-active {
  transition: all 0.4s ease;
}

.stamp-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-10deg);
}

.stamp-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(10deg);
}

.stamp-leave-active {
  position: absolute;
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .tbr-list__title {
    font-size: 2rem;
    padding: 0.5rem 1rem;
  }

  .stamp {
    width: 140px;
  }

  .stamp__image-container {
    height: 180px;
  }
}
</style>
