<script setup>
// Lista "To Be Read" — exibe livros pendentes em formato de selos (stamps) com rotação alternada
import { ref } from 'vue';
import { useBookStore } from '@/stores/bookStore';
import { BOOK_STATUS_MAP } from '@/constants/book';
import StateHandler from '@/components/ui/StateHandler.vue';
import BookCover from '@/components/books/BookCover/BookCover.vue';
import HandDrawnCircle from '@/components/ui/HandDrawnCircle.vue';
import { useBookNavigation } from '@/composables/useBookNavigation';
import { useBookFormatters } from '@/composables/useBookFormatters';

const bookStore = useBookStore();
const { navigateToEdit } = useBookNavigation();
const { getAuthorString } = useBookFormatters();

// Bloco de texto circulado pelo canvas (medido por coords de layout)
const headingEl = ref(null);
</script>

<template>
  <div class="tbr-list">
    <header class="tbr-list__header">
      <HandDrawnCircle :target="headingEl" />

      <div ref="headingEl" class="tbr-list__heading">
        <h1 class="tbr-list__title">To Be Read</h1>
        <p class="tbr-list__subtitle">
          {{ bookStore.tbrCount }} {{ bookStore.tbrCount === 1 ? 'livro' : 'livros' }} para ler
        </p>
      </div>
    </header>

    <StateHandler
      :loading="bookStore.loadingStates.tbr"
      :error="bookStore.hasError ? bookStore.error : false"
      :empty="bookStore.bookLists.tbr.length === 0"
      loading-message="Carregando livros..."
      empty-title="Lista vazia"
      empty-text='Adicione livros com o status "To be read" para vê-los aqui!'
      @retry="bookStore.fetchBooksByStatus(undefined, BOOK_STATUS_MAP.TO_BE_READ)"
    >
      <TransitionGroup name="stamp" tag="div" class="tbr-list__grid">
        <div
          v-for="(book, index) in bookStore.bookLists.tbr"
          :key="book.id"
          class="stamp-wrapper"
          :style="{ transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)` }"
        >
          <article class="stamp" @click="navigateToEdit(book.id)">
            <div class="stamp__inner">
              <div class="stamp__image-container">
                <BookCover
                  :src="book.cover?.[0]"
                  :alt="`Capa do livro ${book.title}`"
                  class="stamp__image"
                />
                <div class="stamp__overlay" aria-hidden="true"></div>
              </div>

              <div class="stamp__details">
                <h3 class="stamp__title">{{ book.title }}</h3>
                <p class="stamp__author">
                  {{ getAuthorString(book) || 'Autor desconhecido' }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </TransitionGroup>
    </StateHandler>
  </div>
</template>

<style scoped>
/* ===== CONTAINER PRINCIPAL ===== */
/* Rola na vertical quando o conteúdo excede o card (80vh/90vh) */
.tbr-list {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

/* ===== HEADER ===== */
.tbr-list__header {
  text-align: center;
  padding: 2rem 2rem 1.5rem 1.5rem;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

/* inline-block: a largura acompanha o texto, então o canvas o circula de perto */
.tbr-list__heading {
  display: inline-block;
}
.tbr-list__title {
  font-size: 2.5rem;
  color: var(--black);
  text-transform: uppercase;
  letter-spacing: 2px;
  /* sem as margens padrão do h1, que deixariam o traço solto no header */
  margin: 0;
}

.tbr-list__subtitle {
  color: var(--black);
  margin: 0.2rem 0 0;
}

/* ===== ESTADOS (ERROR, LOADING, EMPTY) — estilos no StateHandler ===== */

/* ===== GRID DE LIVROS ===== */
.tbr-list__grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7rem;
  padding-top: 2rem;
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
  background: var(--white);
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
  background-image: radial-gradient(circle at 9px 9px, transparent 6px, var(--white) 7px);
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
  color: var(--black);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stamp__author {
  font-size: 0.7rem;
  color: var(--muted);
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
