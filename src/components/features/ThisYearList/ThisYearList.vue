// Lista de livros lidos no ano atual agrupados por mês
<script setup>
import { useBookStore } from '@/stores/bookStore';
import StateHandler from '@/components/ui/StateHandler.vue';
import { computed } from 'vue';
// import tape from '@/assets/images/tape.webp'
import CardStatus from '@/components/books/BookCard/CardStatus.vue';
import BookCover from '@/components/books/BookCover/BookCover.vue';
import { useBookNavigation } from '@/composables/useBookNavigation';

const bookStore = useBookStore();
const { navigateToEdit } = useBookNavigation();
const currentYear = new Date().getFullYear();

function getMonthFromBook(book) {
  const dataStr = book.startEnd?.end || book.startEnd?.start;
  if (!dataStr) return null;
  const date = new Date(dataStr);
  if (isNaN(date)) return null;
  return {
    month: date.getMonth(),
    label: date.toLocaleDateString('pt-BR', { month: 'long' }),
    year: date.getFullYear(),
  };
}

const booksByMonth = computed(() => {
  const groups = {};
  const noDateBooks = [];
  for (const book of bookStore.bookLists.thisYear) {
    const m = getMonthFromBook(book);
    if (!m) {
      noDateBooks.push(book);
      continue;
    }
    const key = `${m.year}-${String(m.month).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = { label: m.label, books: [] };
    groups[key].books.push(book);
  }
  const sections = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
  if (noDateBooks.length) {
    sections.push({ label: 'Sem data', books: noDateBooks });
  }
  return sections;
});
</script>

<template>
  <div class="this-year">
    <img
      class="this-year__image--right"
      src="@/assets/images/cards/card_this_year/right.webp"
      alt=""
    />
    <img
      class="this-year__image--left-bottom"
      src="@/assets/images/cards/card_this_year/left_bottom.webp"
      alt=""
    />
    <img
      class="this-year__image--left-top"
      src="@/assets/images/cards/card_this_year/left_top.webp"
      alt=""
    />
    <!-- <header class="this-year__header">
      <h1 class="this-year__title">
        Lidos em <br />
        {{ currentYear }}
      </h1>
    </header> -->

    <StateHandler
      :loading="bookStore.loadingStates.thisYear"
      :error="bookStore.hasError ? bookStore.error : false"
      :empty="bookStore.thisYearCount === 0"
      :loading-message="`Carregando livros lidos em ${currentYear}...`"
      empty-icon=""
      :empty-title="`Nenhum livro lido em ${currentYear}`"
      @retry="bookStore.fetchBooksReadThisYear()"
    >
      <div class="this-year__container">
        <div class="this-year__grid">
          <div v-for="section in booksByMonth" :key="section.label" class="this-year__month-group">
            <h2 class="this-year__month-title">
              {{ section.books.length }} lidos em <span>{{ section.label }}</span>
            </h2>
            <div class="this-year__grid">
              <article v-for="book in section.books" :key="book.id" class="this-year-card">
                <div class="this-year-card__cover">
                  <CardStatus :back="true" :book="book" tight />

                  <BookCover
                    :src="book.cover?.[0]"
                    :alt="`Capa do livro ${book.title}`"
                    class="this-year-card__image"
                    @click="navigateToEdit(book.id)"
                  />
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </StateHandler>
  </div>
</template>

<style scoped>
.this-year {
  height: 100%;
  overflow: scroll;
}
.this-year img {
  max-width: 300px;
}
.this-year__image--right {
  position: fixed;
  bottom: 0;
  right: 0;
}
.this-year__image--left-bottom {
  position: fixed;
  top: 0;
  left: -9%;
  max-height: 95%;
}
.this-year__image--left-top {
  position: fixed;
  top: 0;
  left: 0;
  max-height: 95%;
}
.this-year__header {
  text-align: center;
  padding: 4rem 2rem;
  background-image: url('/src/assets/images/cards/card_this_year/this-year__header.png');
  background-size: auto;
  background-repeat: no-repeat;
  background-position: center;
}

.this-year__title {
  font-size: 1.5rem;
  color: var(--black);
  text-transform: uppercase;
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
}

.this-year__subtitle {
  font-size: 1.125rem;
  color: var(--black);
  margin: 0;
}

/* ===== ESTADOS (ERROR, LOADING, EMPTY) — estilos no StateHandler ===== */

.this-year__container {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
}

.this-year__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.this-year__month-group {
  width: 100%;
}

.this-year__month-title {
  margin-bottom: 1.75rem;
}
.this-year__month-title span {
  text-transform: capitalize;
}
.this-year-card {
  background: var(--white);
  padding: 0.5rem;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  position: relative;
}

.this-year-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

.this-year-card__cover {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.this-year-card__image {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .this-year-card__cover {
    height: 150px;
  }
}
</style>
