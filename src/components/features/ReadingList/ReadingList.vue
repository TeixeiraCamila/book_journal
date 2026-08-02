<script setup>
// Lista de livros em leitura — exibe cards detalhados com barra de progresso
import { useRouter } from 'vue-router'
import { useBookStore } from '@/stores/bookStore'
import { PencilLine } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { BOOK_STATUS_MAP } from '@/constants/book'
const router = useRouter()
const bookStore = useBookStore()
import { useBookFormatters } from '@/composables/useBookFormatters.js'

const { getAuthorString, getPagesString, getPublicationString } = useBookFormatters()

const calculateProgress = (currentlyOn, total) => {
  if (!currentlyOn || !total || total === 0) return 0
  return Math.round((parseInt(currentlyOn) / parseInt(total)) * 100)
}
/**
 * Formata data para exibição em português
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('pt-BR')
}

/**
 * Formata string de período de leitura
 */
const getReadingPeriodString = (book) => {
  const se = book.startEnd

  if (!se?.start || !se?.end) return ''

  const start = formatDate(se.start)
  const end = formatDate(se.end)

  return `Lido de ${start} até ${end}`
}

/**
 * Formata string de tipo
 */
const getTypeString = (book) => {
  if (!book.type?.length) return ''
  return ` ${book.type.join(', ')}`
}

/**
 * Retorna notas adicionais
 */
const getAdditionalNotes = (book) => {
  const notes = []

  if (book.notes) {
    notes.push(book.notes)
  }

  if (book.tags?.length) {
    notes.push(`Tags: ${book.tags.join(', ')}`)
  }

  return notes
}

/**
 * Verifica se há informações de publicação
 */
const hasPublicationInfo = (book) => {
  return !!(book.publishedBy?.[0] || book.firstPublished)
}

/**
 * Navega para editar livro
 */
const navigateToEdit = (bookId) => {
  router.push(`/editar/${bookId}`)
}
</script>

<template>
  <div class="reading-list">
    <header class="reading-list__header">
      <h1 class="reading-list__title">Em Leitura</h1>
      <p class="reading-list__subtitle">
        {{ bookStore.bookLists.reading.length }}
        {{ bookStore.bookLists.reading.length === 1 ? 'livro' : 'livros' }} em leitura
      </p>
    </header>

    <div v-if="bookStore.hasError && !bookStore.loadingStates.reading" class="reading-list__error">
      <div class="reading-list__error-icon">⚠️</div>
      <p class="reading-list__error-message">{{ bookStore.error }}</p>
      <Button
        class="reading-list__retry-btn"
        @click="bookStore.fetchBooksByStatus(undefined, BOOK_STATUS_MAP.READING)"
      >
        Tentar Novamente
      </Button>
    </div>

    <LoadingSpinner v-else-if="bookStore.loadingStates.reading">
      <p>Carregando livros em leitura...</p>
    </LoadingSpinner>

    <div
      v-else-if="bookStore.bookLists.reading.length === 0 && !bookStore.loadingStates.reading"
      class="reading-list__empty"
    >
      <div class="reading-list__empty-icon">📚</div>
      <h2 class="reading-list__empty-title">Nenhum livro em leitura</h2>
      <p class="reading-list__empty-text">
        Adicione livros com o status "Reading" para vê-los aqui!
      </p>
    </div>

    <div v-else class="reading-list__container">
      <div class="reading-list__grid">
        <article
          v-for="(book, index) in bookStore.bookLists.reading"
          :key="book.id"
          class="reading-card"
          :class="`reading-card--blob-${(index % 6) + 1}`"
        >
          <!-- Capa do livro -->
          <div class="reading-card__cover">
            <img
              v-if="book.cover?.[0]"
              :src="book.cover[0]"
              :alt="`Capa do livro ${book.name}`"
              class="reading-card__image"
              loading="lazy"
            />
            <div v-else class="reading-card__placeholder" aria-label="Sem capa disponível">📖</div>
          </div>

          <div class="reading-card__content">
            <header class="reading-card__header">
              <div class="reading-card__title-group">
                <div>
                  <h2 class="reading-card__title">{{ book.name }}</h2>

                  <div class="reading-card__type" v-if="getTypeString(book)">
                    <span class="reading-card__value">{{ getTypeString(book) }}</span>
                  </div>
                </div>
                <span class="reading-card__author">{{ getAuthorString(book) }}</span>
              </div>
            </header>

            <div class="reading-card__info">
              <div class="reading-card__info-item" v-if="hasPublicationInfo(book)">
                <span class="reading-card__label">Publicação:</span>
                <span class="reading-card__value">{{ getPublicationString(book) }}</span>
              </div>

              <div class="reading-card__info-item" v-if="getReadingPeriodString(book)">
                <span class="reading-card__label">Período:</span>
                <span class="reading-card__value">{{ getReadingPeriodString(book) }}</span>
              </div>

              <div class="reading-card__info-item" v-if="book.totalPages && book.currentlyOn">
                <span class="reading-card__label">Progresso:</span>
                <div class="reading-card__progress">
                  <div class="reading-card__progress-text">
                    <span>{{ getPagesString(book) }}</span>
                  </div>
                  <div class="reading-card__progress-bar">
                    <div
                      class="reading-card__progress-fill"
                      :style="{ width: `${calculateProgress(book.currentlyOn, book.totalPages)}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <div class="reading-card__info-item" v-if="book.genres?.length">
                <span class="reading-card__label">Gêneros:</span>
                <div class="reading-card__genres">
                  <span
                    v-for="(genre, index) in book.genres"
                    :key="index"
                    class="reading-card__genre"
                  >
                    {{ genre }}
                  </span>
                </div>
              </div>

              <div class="reading-card__info-item" v-if="getAdditionalNotes(book).length > 0">
                <span class="reading-card__label">Notas:</span>
                <div class="reading-card__notes">
                  <p
                    v-for="(note, index) in getAdditionalNotes(book)"
                    :key="index"
                    class="reading-card__note"
                  >
                    {{ note }}
                  </p>
                </div>
              </div>
            </div>

            <div class="reading-card__actions">
              <Button class="reading-card__edit-btn" @click="navigateToEdit(book.id)">
                <PencilLine :size="16" />
                Editar
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reading-list {
  min-height: 100%;
}

/* ===== HEADER ===== */
.reading-list__header {
  text-align: center;
  padding: 2rem;
  background-image: url('@/assets/images/cards/card_stats/tape-title.webp');
  background-size: auto;
  background-repeat: no-repeat;
  background-position: center;
}

.reading-list__title {
  font-size: 2rem;
  color: var(--black);
  text-transform: uppercase;
  font-family: 'Raleway', sans-serif;
  font-weight: 700;
}

.reading-list__subtitle {
  font-size: 1.125rem;
  color: var(--black);
  margin: 0;
}

/* ===== ESTADOS (ERROR, LOADING, EMPTY) ===== */
.reading-list__error,
.reading-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--black);
}

/* Estado de Erro */
.reading-list__error {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  margin: 2rem;
}

.reading-list__error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.reading-list__error-message {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  color: var(--black);
}

.reading-list__retry-btn {
  padding: 0.75rem 2rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reading-list__retry-btn:hover {
  background: #c27a76;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(218, 147, 143, 0.3);
}

/* Estado Vazio */
.reading-list__empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.reading-list__empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.reading-list__empty-text {
  color: var(--muted);
  max-width: 400px;
}

/* ===== GRID DE LIVROS ===== */
.reading-list__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.reading-list__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

/* ===== CARD DE LEITURA ===== */
.reading-card {
  background: white;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  gap: 2rem;
  width: 100%;
}

.reading-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.reading-card__cover {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

.reading-card__image {
  width: 100%;
  height: 100%;
  max-height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.reading-card__placeholder {
  font-size: 4rem;
  color: #94a3b8;
  filter: grayscale(1);
}

.reading-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.reading-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.reading-card__title-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.reading-card__title-group > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reading-card__type {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
}

.reading-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--black);
  margin: 0;
  line-height: 1.2;
}

/* Informações */
.reading-card__info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reading-card__info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.reading-card__label {
  font-size: 0.75rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.reading-card__value {
  font-size: 0.95rem;
  color: var(--black);
  line-height: 1.4;
}

/* Progresso de leitura */
.reading-card__progress {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reading-card__progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--black);
}

.reading-card__progress-bar {
  height: 8px;
  background: var(--accent_muted);
  border-radius: 999px;
  overflow: hidden;
}

.reading-card__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent3), var(--accent));
  transition: width 0.3s ease;
}

/* Gêneros */
.reading-card__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.reading-card__genre {
  background: var(--accent_muted);
  color: var(--black);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(182, 112, 142, 0.3);
}

/* Notas */
.reading-card__notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reading-card__note {
  background: var(--accent3_muted);
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid var(--accent3);
  font-size: 0.875rem;
  color: var(--black);
  margin: 0;
}

/* Ações */
.reading-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--accent_muted);
}

.reading-card__edit-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reading-card__edit-btn:hover {
  background: #c27a76;
  transform: translateY(-2px);
}

/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .reading-list__grid {
    flex-direction: column;
  }

  .reading-card {
    min-height: auto;
    flex-direction: column;
    gap: 1rem;
  }

  .reading-card__cover {
    height: 150px;
  }

  .reading-card__content {
    padding: 1rem;
  }

  .reading-card__title {
    font-size: 1.25rem;
  }

  .reading-card__actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .reading-list__header {
    padding: 1.5rem 1rem;
  }

  .reading-list__container {
    padding: 1rem;
  }

  .reading-card__cover {
    height: 120px;
  }
}
</style>
