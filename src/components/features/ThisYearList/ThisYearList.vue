// Componente: lista livros lidos no ano atual agrupados por mês
<script setup>
import { useRouter } from 'vue-router';
import { use_book_store } from '@/stores/bookStore';
import Button from '@/components/ui/Button.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import { computed } from 'vue';
// import tape from '@/assets/images/tape.webp'
import CardStatus from '@/components/books/BookCard/CardStatus.vue';

const router = useRouter();
const bookStore = use_book_store();
const current_year = new Date().getFullYear();

function get_month_from_book(book) {
  const data_str = book.startEnd?.end || book.startEnd?.start;
  if (!data_str) return null;
  const date = new Date(data_str);
  if (isNaN(date)) return null;
  return {
    month: date.getMonth(),
    label: date.toLocaleDateString('pt-BR', { month: 'long' }),
    year: date.getFullYear(),
  };
}

const books_by_month = computed(() => {
  const groups = {};
  const no_date_books = [];
  for (const book of bookStore.book_lists.thisYear) {
    const m = get_month_from_book(book);
    if (!m) {
      no_date_books.push(book);
      continue;
    }
    const key = `${m.year}-${String(m.month).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = { label: m.label, books: [] };
    groups[key].books.push(book);
  }
  const sections = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
  if (no_date_books.length) {
    sections.push({ label: 'Sem data', books: no_date_books });
  }
  return sections;
});

const navigate_to_edit = (bookId) => {
  router.push(`/editar/${bookId}`);
};
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
        {{ current_year }}
      </h1>
    </header> -->

    <div v-if="bookStore.has_error && !bookStore.loading_states.thisYear" class="this-year__error">
      <p class="this-year__error-message">{{ bookStore.error }}</p>
      <Button @click="bookStore.fetch_books_read_this_year()"> Tentar Novamente </Button>
    </div>

    <LoadingSpinner v-else-if="bookStore.loading_states.thisYear">
      <p>Carregando livros lidos em {{ current_year }}...</p>
    </LoadingSpinner>

    <div
      v-else-if="bookStore.this_year_count === 0 && !bookStore.loading_states.thisYear"
      class="this-year__empty"
    >
      <h2 class="this-year__empty-title">Nenhum livro lido em {{ current_year }}</h2>
    </div>

    <div v-else class="this-year__container">
      <div class="this-year__grid">
        <div v-for="section in books_by_month" :key="section.label" class="this-year__month-group">
          <h2 class="this-year__month-title">{{ section.label }} - {{ section.books.length }}</h2>
          <div class="this-year__grid">
            <article v-for="book in section.books" :key="book.id" class="this-year-card">
              <div class="this-year-card__cover">
                <CardStatus :back="true" :book="book" />

                <img
                  v-if="book.cover?.[0]"
                  :src="book.cover[0]"
                  :alt="`Capa do livro ${book.title}`"
                  class="this-year-card__image"
                  loading="lazy"
                  @click="navigate_to_edit(book.id)"
                />
                <div v-else class="this-year-card__placeholder">📖</div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.this-year-card__cover .card-status__tape img {
  max-width: 100px;
}
</style>

<style scoped>
.this-year {
  min-height: 100%;
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

.this-year__error,
.this-year__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--black);
}

.this-year__error {
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius);
  margin: 2rem;
}

.this-year__error-message {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.this-year__empty-title {
  font-size: 1.5rem;
  font-weight: 600;
}

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
  text-transform: uppercase;
  margin-bottom: 1.75rem;
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

.this-year-card__cover .card-status__tape {
  position: absolute;
  top: -15%;
  left: 50%;
  z-index: 1;
}

.this-year-card__cover .card-status__tape .card-status__text {
  position: absolute;
  top: 40%;
  left: 45%;
  transform: translate(-40%, -50%);
  width: 60%;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--black);
  text-transform: uppercase;
  line-height: 1.2;
}

.this-year-card__image {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
}

.this-year-card__placeholder {
  font-size: 4rem;
  color: var(--muted);
  filter: grayscale(1);
}

@media (max-width: 768px) {
  .this-year-card__cover {
    height: 150px;
  }
}
</style>
