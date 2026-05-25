<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue'
import { useBookStore } from '@/stores/bookStore'
import { BOOK_STATUS_FALLBACK, BOOK_RATE_LABELS, BOOK_TYPES_FALLBACK } from '@/constants/book'

import { parseCommaSeparated } from '@/utils/validation'
import { useNotifications } from '@/composables/useNotifications'
import FormSection from '../FormSection.vue'
import FormField from '../FormField.vue'
import FormActions from '../FormActions.vue'
import Button from '../../ui/Button.vue'

// Recebe o livro para edição ou null para criação
const props = defineProps({
  book: {
    type: Object,
    default: null,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['cancel', 'submit', 'edit-success'])
const bookStore = useBookStore()
const { addNotification } = useNotifications()

const formData = reactive({
  name: '',
  author: '',
  status: '',
  rate: '',
  totalPages: '',
  currentlyOn: '',
  type: '',
  firstPublished: '',
  iHaveCopy: false,
  wasReadIn: '',
  startDate: '',
  endDate: '',
  coverUrl: '',
  literaryAtlas: '',
  // Inicia como array vazio — o multi-select lida com adição/remoção
  genres: [],
  publishedBy: '',
  bookSeries: '',
  // Inicia como array vazio — o multi-select lida com adição/remoção
  quest: [],
})

// Armazena erros de validação de cada campo
const fieldErrors = ref({})
// Impede múltiplos envios enquanto a requisição está em andamento
const isSubmitting = ref(false)

// Opções carregadas do Notion via API, com fallback para valores locais
const statusOptions = computed(() => bookStore.bookOptions?.Status || BOOK_STATUS_FALLBACK)
const rateOptions = computed(() =>
  bookStore.bookOptions?.Rate
    ? Object.keys(BOOK_RATE_LABELS).filter((r) => bookStore.bookOptions.Rate.includes(r))
    : Object.keys(BOOK_RATE_LABELS)
)
const typeOptions = computed(() => bookStore.bookOptions?.Type || BOOK_TYPES_FALLBACK)
const atlasOptions = computed(() => bookStore.bookOptions?.Atlas || [])
const seriesOptions = computed(() => bookStore.bookOptions?.['Book Series Name'] || [])
const publishedYearOptions = computed(() =>
  (bookStore.bookOptions?.['First published in'] || []).filter((y) => y !== '0000')
)
const authorOptions = computed(() => bookStore.bookOptions?.Author || [])
const wasReadInOptions = computed(() => bookStore.bookOptions?.['Was read in'] || [])
const genresOptions = computed(() => bookStore.bookOptions?.Tags || [])
const publishedByOptions = computed(() => bookStore.bookOptions?.['Published by'] || [])
const questOptions = computed(() => bookStore.bookOptions?.Quest || [])

// Retorna null se vazio para não quebrar a exibição da capa
const coverUrl = computed(() => {
  if (formData.coverUrl) {
    return formData.coverUrl.trim() || null
  }
  return null
})

// Carrega as opções do Notion na montagem,
// depois preenche o formulário se for edição
onMounted(async () => {
  if (!bookStore.bookOptions) {
    await bookStore.fetchBookOptions()
  }

  if (props.book && props.isEdit) {
    hydrateForm(props.book)
  }
})

// Função auxiliar para parsing robusto de startEnd
const parseStartEndData = (startEndData) => {
  if (!startEndData) {
    formData.startDate = ''
    formData.endDate = ''
    return
  }

  try {
    if (typeof startEndData === 'object' && startEndData !== null) {
      formData.startDate = startEndData.start || ''
      formData.endDate = startEndData.end || ''
    } else if (typeof startEndData === 'string' && startEndData.includes('/')) {
      const [start, end] = startEndData.split('/')
      formData.startDate = start?.trim() || ''
      formData.endDate = end?.trim() || ''
    } else if (typeof startEndData === 'string') {
      formData.startDate = startEndData || ''
      formData.endDate = ''
    } else if (Array.isArray(startEndData)) {
      formData.startDate = startEndData[0] || ''
      formData.endDate = startEndData[1] || ''
    } else {
      formData.startDate = ''
      formData.endDate = ''
    }
  } catch {
    formData.startDate = ''
    formData.endDate = ''
  }
}

// Função auxiliar para preencher formData a partir de um livro
const hydrateForm = (book) => {
  if (!book) return

  formData.name = book.name || ''
  formData.author = book.author?.join(', ') || ''
  formData.status = book.status || ''
  formData.rate = book.rate || ''
  formData.totalPages = book.totalPages || ''
  formData.currentlyOn = book.currentlyOn || ''
  formData.type = book.type?.join(', ') || ''
  formData.firstPublished = book.firstPublished || ''
  formData.iHaveCopy = book.iHaveCopy || false
  formData.wasReadIn = book.wasReadIn?.join(', ') || ''
  formData.coverUrl = book.cover?.[0] || ''
  formData.literaryAtlas = book.literaryAtlas || ''
  formData.genres = book.genres || []
  formData.publishedBy = book.publishedBy?.join(', ') || ''
  formData.bookSeries = book.bookSeries || ''
  formData.quest = book.quest || []

  parseStartEndData(book.startEnd)
}

// Watch para atualizar o form quando o livro mudar (caso o book seja carregado assíncronamente)
watch(
  () => props.book,
  (newBook) => {
    if (newBook && props.isEdit) {
      hydrateForm(newBook)
    }
  },
  { immediate: true }
)

// Auto-setar status para Read quando endDate for preenchido
watch(
  () => formData.endDate,
  (newEndDate) => {
    if (newEndDate && formData.status !== 'Read') {
      formData.status = 'Read'
    }
  }
)

// Valida campos, monta o objeto e envia para a API via store
const handleSubmit = async () => {
  // Reinicia os erros e a lista para exibir apenas os novos
  fieldErrors.value = {}
  const errorMessages = []

  if (!formData.name || !formData.name.trim()) {
    fieldErrors.value.name = 'Título é obrigatório'
    errorMessages.push('Título')
  }

  if (!formData.author || !formData.author.trim()) {
    fieldErrors.value.author = 'Autor é obrigatório'
    errorMessages.push('Autor')
  }

  if (formData.totalPages) {
    if (isNaN(formData.totalPages) || formData.totalPages < 0) {
      fieldErrors.value.totalPages = 'Total de páginas deve ser um número positivo'
      errorMessages.push('Total de páginas')
    }
  }

  if (formData.currentlyOn) {
    if (isNaN(formData.currentlyOn) || formData.currentlyOn < 0) {
      fieldErrors.value.currentlyOn = 'Página atual deve ser um número positivo'
      errorMessages.push('Página atual')
    } else if (formData.totalPages && Number(formData.currentlyOn) > Number(formData.totalPages)) {
      fieldErrors.value.currentlyOn = 'Página atual não pode ser maior que o total'
      errorMessages.push('Página atual')
    }
  }

  // Validação de ano (opcional - só valida se preenchido)
  if (formData.firstPublished) {
    const currentYear = new Date().getFullYear()
    if (!/^\d{4}$/.test(formData.firstPublished)) {
      fieldErrors.value.firstPublished = 'Ano deve ter 4 dígitos'
      errorMessages.push('Ano de publicação')
    } else if (
      Number(formData.firstPublished) < 1000 ||
      Number(formData.firstPublished) > currentYear + 1
    ) {
      fieldErrors.value.firstPublished = `Ano deve estar entre 1000 e ${currentYear + 1}`
      errorMessages.push('Ano de publicação')
    }
  }

  // Validação de datas (opcional - só valida se ambas preenchidas)
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)

    if (start > end) {
      fieldErrors.value.endDate = 'Data de término deve ser posterior à data de início'
      errorMessages.push('Data de término')
    }
  }

  // Só mostra notificação se houver erros
  if (errorMessages.length > 0) {
    addNotification(`Corrija: ${errorMessages.join(', ')}`, 'error')
    return
  }

  isSubmitting.value = true

  try {
    // Montar startEnd corretamente (objeto com datas ISO 8601)
    let startEndValue = undefined
    if (formData.startDate || formData.endDate) {
      if (formData.startDate && formData.endDate) {
        startEndValue = {
          start: formData.startDate,
          end: formData.endDate,
          time_zone: null,
        }
      } else {
        startEndValue = {
          start: formData.startDate || formData.endDate,
          time_zone: null,
        }
      }
    }

    const bookData = {
      name: formData.name.trim(),
      author: parseCommaSeparated(formData.author),
      status: formData.status || undefined,
      rate: formData.rate || undefined,
      totalPages: formData.totalPages ? Number(formData.totalPages) : undefined,
      currentlyOn: formData.currentlyOn ? Number(formData.currentlyOn) : undefined,
      type: parseCommaSeparated(formData.type)[0] || undefined,
      firstPublished: formData.firstPublished || undefined,
      iHaveCopy: formData.iHaveCopy,
      wasReadIn: parseCommaSeparated(formData.wasReadIn),
      startEnd: startEndValue,
      coverUrl: formData.coverUrl?.trim() || undefined,
      literaryAtlas: formData.literaryAtlas || undefined,
      genres: formData.genres,
      publishedBy: parseCommaSeparated(formData.publishedBy),
      bookSeries: formData.bookSeries || undefined,
      quest: formData.quest,
    }

    // Se tem ID na rota: atualiza. Senão: cria um novo livro
    if (props.isEdit && props.book) {
      await bookStore.updateBook(props.book.id, bookData)
      addNotification('Livro atualizado com sucesso!', 'success')
      emit('edit-success', props.book.id)
    } else {
      await bookStore.createBook(bookData)
      addNotification('Livro criado com sucesso!', 'success')
    }

    // Após criar, limpa os campos. Na edição mantém os valores.
    if (!props.isEdit) {
      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === 'boolean') {
          formData[key] = false
        } else if (Array.isArray(formData[key])) {
          formData[key] = []
        } else {
          formData[key] = ''
        }
      })
    }

    emit('submit')
  } catch {
    addNotification(`Erro ao ${props.isEdit ? 'atualizar' : 'criar'} livro`, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// Volta para a página anterior sem salvar
const handleCancel = () => {
  // Na criação limpa os dados; na edição o livro permanece intacto
  if (!props.isEdit) {
    Object.keys(formData).forEach((key) => {
      if (typeof formData[key] === 'boolean') {
        formData[key] = false
      } else if (Array.isArray(formData[key])) {
        formData[key] = []
      } else {
        formData[key] = ''
      }
    })
  }

  emit('cancel')
}
</script>

<template>
  <div class="book-form">
    <div class="book-form__header">
      <h2 class="book-form__title">
        {{ isEdit ? 'Editar Livro' : 'Adicionar Novo Livro' }}
      </h2>
      <Button @click="handleCancel" class="book-form__close-btn" variant="secondary">×</Button>
    </div>

    <form @submit.prevent="handleSubmit" class="book-form__content">
      <!-- Layout: 30% Cover | 70% Campos -->
      <div class="book-form__layout">
        <!-- Coluna Cover (30%) -->
        <div class="book-form__cover-section">
          <div class="book-form__cover-container">
            <img
              v-if="coverUrl"
              :src="coverUrl"
              alt="Capa do livro"
              class="book-form__cover-image"
            />
            <div v-else class="book-form__cover-placeholder">
              <span>📖</span>
              <p>Sem capa</p>
            </div>
          </div>

          <FormField
            v-model="formData.coverUrl"
            label="URL da Capa"
            placeholder="Cole a URL da imagem"
            :error="fieldErrors.coverUrl"
          />
        </div>

        <!-- Coluna Campos (70%) -->
        <div class="book-form__fields">
          <!-- Informações Básicas -->
          <FormSection title="Informações Básicas">
            <div class="book-form__grid">
              <FormField
                v-model="formData.name"
                label="Título"
                placeholder="Ex: 1984"
                required
                :error="fieldErrors.name"
              />

              <FormField
                v-model="formData.author"
                label="Autor"
                type="autocomplete"
                :options="authorOptions"
                placeholder="Digite ou selecione"
                required
                :error="fieldErrors.author"
              />
            </div>
            <FormField
              v-model="formData.bookSeries"
              label="Série do livro"
              type="autocomplete"
              :options="seriesOptions"
              placeholder="Digite ou selecione"
              :error="fieldErrors.bookSeries"
            />
            <FormField
              v-model="formData.quest"
              label="Quest"
              type="multi-select"
              :options="questOptions"
              placeholder="Digite ou selecione"
              :error="fieldErrors.quest"
            />
          </FormSection>

          <!-- Status e Progresso -->
          <FormSection title="Status e Progresso">
            <div class="book-form__grid">
              <FormField
                v-model="formData.status"
                label="Status"
                type="select"
                :options="statusOptions"
                :error="fieldErrors.status"
              />

              <FormField
                v-model="formData.totalPages"
                label="Total de páginas"
                type="number"
                placeholder="Ex: 350"
                :error="fieldErrors.totalPages"
              />

              <FormField
                v-if="formData.status === 'Reading'"
                v-model="formData.currentlyOn"
                label="Página atual"
                type="number"
                placeholder="Ex: 125"
                :error="fieldErrors.currentlyOn"
              />
            </div>
          </FormSection>

          <!-- Avaliação e Classificação -->
          <FormSection title="Avaliação e Classificação">
            <div class="book-form__grid">
              <FormField
                v-if="formData.status === 'Read'"
                v-model="formData.rate"
                label="Avaliação"
                type="select"
                :options="rateOptions"
                :labels="BOOK_RATE_LABELS"
                placeholder="Selecione uma avaliação"
                :error="fieldErrors.rate"
              />

              <FormField
                v-model="formData.type"
                label="Tipo"
                type="select"
                :options="typeOptions"
                placeholder="Selecione o tipo"
                :error="fieldErrors.type"
              />

              <FormField
                v-model="formData.genres"
                label="Gêneros/Tags"
                type="multi-select"
                :options="genresOptions"
                placeholder="Digite ou selecione"
                :error="fieldErrors.genres"
              />
            </div>
          </FormSection>

          <!-- Detalhes da Publicação -->
          <FormSection title="Detalhes da Publicação">
            <div class="book-form__grid">
              <FormField
                v-model="formData.firstPublished"
                label="Ano de publicação"
                type="autocomplete"
                :options="publishedYearOptions"
                placeholder="Digite ou selecione"
                :error="fieldErrors.firstPublished"
              />

              <FormField
                v-model="formData.publishedBy"
                label="Publicado por"
                type="autocomplete"
                :options="publishedByOptions"
                placeholder="Digite ou selecione"
                :error="fieldErrors.publishedBy"
              />

              <div class="book-form__checkbox-field" v-if="formData.type === '📘 Paper'">
                <FormField
                  v-model="formData.iHaveCopy"
                  label="Possuo cópia física"
                  type="checkbox"
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Leitura e Metadados">
            <div class="book-form__grid">
              <FormField
                v-model="formData.wasReadIn"
                label="Lido em"
                type="autocomplete"
                :options="wasReadInOptions"
                placeholder="Digite ou selecione"
                :error="fieldErrors.wasReadIn"
              />

              <FormField
                v-model="formData.startDate"
                label="Data de início"
                type="date"
                :error="fieldErrors.startDate"
              />

              <FormField
                v-model="formData.endDate"
                label="Data de término"
                type="date"
                :error="fieldErrors.endDate"
              />

              <FormField
                v-model="formData.literaryAtlas"
                label="Atlas literário"
                type="autocomplete"
                :options="atlasOptions"
                placeholder="Selecione ou digite"
                :error="fieldErrors.literaryAtlas"
              />
            </div>
          </FormSection>
        </div>
      </div>

      <!-- Ações -->
      <FormActions
        :is-submitting="isSubmitting"
        :is-loading="bookStore.loadingStates.main"
        submit-text="Salvar Livro"
        cancel-text="Cancelar"
        @cancel="handleCancel"
      />
    </form>
  </div>
</template>

<style scoped>
.book-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
}

.book-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.book-form__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.book-form__close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.book-form__close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.book-form__content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.book-form__layout {
  display: grid;
  grid-template-columns: 30% 70%;
  gap: 1.5rem;
  width: calc(100% - 1.5rem);
}

.book-form__cover-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-form__cover-container {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-form__cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-form__cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
}

.book-form__cover-placeholder span {
  font-size: 3rem;
}

.book-form__cover-placeholder p {
  margin: 0;
  font-size: 0.875rem;
}

.book-form__fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

.book-form__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.book-form__checkbox-field {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(218, 147, 143, 0.05);
  border-radius: 0.5rem;
  border: 1px solid var(--accent_muted);
}

/* Responsividade */
@media (max-width: 768px) {
  .book-form__content {
    padding: 1rem;
  }

  .book-form__layout {
    grid-template-columns: 1fr;
  }

  .book-form__cover-section {
    order: -1;
  }

  .book-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
