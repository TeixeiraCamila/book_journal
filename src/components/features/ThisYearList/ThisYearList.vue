// Componente: lista livros lidos no ano atual agrupados por mês
<script setup>
import { useRouter } from 'vue-router'
import { useBookStore } from '@/stores/bookStore'
import Button from '@/components/ui/Button.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { computed } from 'vue'
import tape from '@/assets/images/tape.webp'

const router = useRouter()
const bookStore = useBookStore()
const currentYear = new Date().getFullYear()

function getMonthFromBook(book) {
  const dataStr = book.startEnd?.end || book.startEnd?.start
  if (!dataStr) return null
  const date = new Date(dataStr)
  if (isNaN(date)) return null
  return {
    month: date.getMonth(),
    label: date.toLocaleDateString('pt-BR', { month: 'long' }),
    year: date.getFullYear(),
  }
}

const booksByMonth = computed(() => {
  const groups = {}
  const noDateBooks = []
  for (const book of bookStore.bookLists.thisYear) {
    const m = getMonthFromBook(book)
    if (!m) {
      noDateBooks.push(book)
      continue
    }
    const key = `${m.year}-${String(m.month).padStart(2, '0')}`
    if (!groups[key]) groups[key] = { label: m.label, books: [] }
    groups[key].books.push(book)
  }
  const sections = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
  if (noDateBooks.length) {
    sections.push({ label: 'Sem data', books: noDateBooks })
  }
  return sections
})


const navigateToEdit = (bookId) => {
  router.push(`/editar/${bookId}`)
}
</script>

<template>
  <div class="this-year">
    <header class="this-year__header">
      <h1 class="this-year__title">
        Lidos em <br/> {{ currentYear }}
      </h1>
    </header>

    <div v-if="bookStore.hasError && !bookStore.loadingStates.thisYear" class="this-year__error">
      <p class="this-year__error-message">{{ bookStore.error }}</p>
      <Button @click="bookStore.fetchBooksReadThisYear()">
        Tentar Novamente
      </Button>
    </div>

    <LoadingSpinner v-else-if="bookStore.loadingStates.thisYear">
      <p>Carregando livros lidos em {{ currentYear }}...</p>
    </LoadingSpinner>

    <div
      v-else-if="bookStore.thisYearCount === 0 && !bookStore.loadingStates.thisYear"
      class="this-year__empty"
    >
      <h2 class="this-year__empty-title">Nenhum livro lido em {{ currentYear }}</h2>
    </div>

    <div v-else class="this-year__container">
      <div class="this-year__grid">
        <div v-for="section in booksByMonth" :key="section.label" class="this-year__month-group">
          <h2 class="this-year__month-title">{{ section.label }} - {{ section.books.length }}</h2>
          <div class="this-year__grid">
            <article v-for="book in section.books" :key="book.id" class="this-year-card">
              <div class="this-year-card__cover">
                <div v-if="book.rate" class="card-status__tape">
                  <p class="card-status__text">{{ book.rate }}</p>
                  <img width="90" :src="tape" alt="Tape" />
                </div>

                <img
                  v-if="book.cover?.[0]"
                  :src="book.cover[0]"
                  :alt="`Capa do livro ${book.name}`"
                  class="this-year-card__image"
                  loading="lazy"
                  @click="navigateToEdit(book.id)"
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

<style scoped>
.this-year {
  min-height: 100%;
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
  border-radius: 12px;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.this-year__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.this-year__month-group {
  width: 100%;
}

.this-year__month-title {
  text-transform: uppercase;
  margin-bottom: 1.75rem;
}

.this-year-card {
  background: white;
  padding: .5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
}

.this-year-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.this-year-card__cover {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.this-year-card__cover .card-status__tape {
  position: absolute;
  top:  -15%;
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
  color: #94a3b8;
  filter: grayscale(1);
}

@media (max-width: 768px) {
  .this-year-card__cover {
    height: 150px;
  }
}
</style>
