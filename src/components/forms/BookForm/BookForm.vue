<script setup>
// Formulário de criação/edição de livros — validação, hidratação e envio para API
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { useBookStore } from '@/stores/bookStore';
import {
  BOOK_STATUS_FALLBACK,
  BOOK_RATE_LABELS,
  BOOK_TYPES_FALLBACK,
  BOOK_STATUS_MAP,
} from '@/constants/book';
import { BOOK_FORM_SECTIONS, BOOK_FORM_ACTIONS } from '@/constants/formLayout';

import {
  parseCommaSeparated,
  validateRequired,
  validatePositiveNumber,
  validatePositiveInteger,
  validateYear,
  validateDateRange,
} from '@/utils/validation';
import { useNotifications } from '@/composables/useNotifications';
import { useBookFormatters } from '@/composables/useBookFormatters';
import FormSection from '@/components/forms/FormSection.vue';
import FormField from '@/components/forms/FormField.vue';
import FormActions from '@/components/forms/FormActions.vue';
import BookCover from '@/components/books/BookCover/BookCover.vue';

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
});

const emit = defineEmits(['cancel', 'edit-success']);
const bookStore = useBookStore();
const { addNotification } = useNotifications();
const { getPageFromProgress } = useBookFormatters();

const formData = reactive({
  name: '',
  author: '',
  status: 'To be read',
  rate: '',
  totalPages: '',
  currentPage: '',
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
  // Espelha o contrato da API: série e volume aninhados em seriesInfo
  seriesInfo: { bookSeries: '', volume: '' },
  // Inicia como array vazio — o multi-select lida com adição/remoção
  kindleProgress: '',
});

// Armazena erros de validação de cada campo
const fieldErrors = ref({});
// Impede múltiplos envios enquanto a requisição está em andamento
const isSubmitting = ref(false);

// Opções carregadas do Notion via API, com fallback para valores locais
const statusOptions = computed(() => bookStore.bookOptions?.Status || BOOK_STATUS_FALLBACK);
const rateOptions = computed(() =>
  bookStore.bookOptions?.Rate
    ? Object.keys(BOOK_RATE_LABELS).filter((r) => bookStore.bookOptions.Rate.includes(r))
    : Object.keys(BOOK_RATE_LABELS),
);
const typeOptions = computed(() => bookStore.bookOptions?.Type || BOOK_TYPES_FALLBACK);
const atlasOptions = computed(() => bookStore.bookOptions?.Atlas || []);
const seriesOptions = computed(() => bookStore.bookOptions?.['Book Series Name'] || []);
const publishedYearOptions = computed(() =>
  (bookStore.bookOptions?.['First published in'] || []).filter((y) => y !== '0000'),
);
const authorOptions = computed(() => bookStore.bookOptions?.Author || []);
const wasReadInOptions = computed(() => bookStore.bookOptions?.['Was read in'] || []);
const genresOptions = computed(() => bookStore.bookOptions?.Tags || []);
const publishedByOptions = computed(() => bookStore.bookOptions?.['Published by'] || []);

// Retorna null se vazio para não quebrar a exibição da capa
const coverUrl = computed(() => {
  if (formData.coverUrl) {
    return formData.coverUrl.trim() || null;
  }
  return null;
});

const isKindle = computed(() => formData.type?.includes('Kindle'));

// Converte o progresso informado em página atual (arredondada)
watch([() => formData.kindleProgress, () => formData.totalPages], ([progress, total]) => {
  const page = getPageFromProgress(total, progress);
  if (page !== null) formData.currentPage = page;
});

// Carrega as opções do Notion na montagem,
// depois preenche o formulário se for edição
onMounted(async () => {
  if (!bookStore.bookOptions) {
    await bookStore.fetchBookOptions();
  }

  if (props.book && props.isEdit) {
    hydrateForm(props.book);
  }
});

// Função auxiliar para parsing robusto de startEnd
const parseStartEndData = (startEndData) => {
  if (!startEndData) {
    formData.startDate = '';
    formData.endDate = '';
    return;
  }

  try {
    if (typeof startEndData === 'object' && startEndData !== null) {
      formData.startDate = startEndData.start || '';
      formData.endDate = startEndData.end || '';
    } else if (typeof startEndData === 'string' && startEndData.includes('/')) {
      const [start, end] = startEndData.split('/');
      formData.startDate = start?.trim() || '';
      formData.endDate = end?.trim() || '';
    } else if (typeof startEndData === 'string') {
      formData.startDate = startEndData || '';
      formData.endDate = '';
    } else if (Array.isArray(startEndData)) {
      formData.startDate = startEndData[0] || '';
      formData.endDate = startEndData[1] || '';
    } else {
      formData.startDate = '';
      formData.endDate = '';
    }
  } catch {
    formData.startDate = '';
    formData.endDate = '';
  }
};

// Função auxiliar para preencher formData a partir de um livro
const hydrateForm = (book) => {
  if (!book) return;

  formData.name = book.title || '';
  formData.author = book.author?.join(', ') || '';
  formData.status = book.status || '';
  formData.rate = book.rate || '';
  formData.totalPages = book.pages?.totalPages || '';
  formData.currentPage = book.pages?.currentlyPage || '';
  formData.type = book.type?.join(', ') || '';
  formData.firstPublished = book.firstPublished || '';
  formData.iHaveCopy = book.iHaveCopy || false;
  formData.wasReadIn = book.wasReadIn?.join(', ') || '';
  formData.coverUrl = book.cover?.[0] || '';
  formData.literaryAtlas = book.literaryAtlas || '';
  formData.genres = book.genres || [];
  // publishedBy é select simples no Notion: string, não array
  formData.publishedBy = book.publishedBy || '';
  formData.seriesInfo = {
    bookSeries: book.seriesInfo?.bookSeries || '',
    volume: book.seriesInfo?.volume ?? '',
  };

  formData.kindleProgress = '';

  parseStartEndData(book.startEnd);
};

// Watch para atualizar o form quando o livro mudar (caso o book seja carregado assíncronamente)
watch(
  () => props.book,
  (newBook) => {
    if (newBook && props.isEdit) {
      hydrateForm(newBook);
    }
  },
  { immediate: true },
);

// Auto-setar status para Read e wasReadIn quando endDate for preenchido
watch(
  () => formData.endDate,
  (newEndDate) => {
    if (!newEndDate) return;

    if (formData.status !== BOOK_STATUS_MAP.READ) {
      formData.status = BOOK_STATUS_MAP.READ;
    }

    if (!formData.wasReadIn) {
      const year = new Date(newEndDate).getFullYear();
      if (!isNaN(year)) {
        formData.wasReadIn = String(year);
      }
    }
  },
);

const resetFormData = () => {
  Object.keys(formData).forEach((key) => {
    const valor = formData[key];

    if (typeof valor === 'boolean') formData[key] = false;
    else if (Array.isArray(valor)) formData[key] = [];
    // seriesInfo é objeto e precisa ser repovoado por chave, senão o v-model aninhado quebra
    else if (valor !== null && typeof valor === 'object')
      formData[key] = Object.fromEntries(Object.keys(valor).map((k) => [k, '']));
    else formData[key] = '';
  });
};

// Valida campos, monta o objeto e envia para a API via store
const handleSubmit = async () => {
  // Reinicia os erros e a lista para exibir apenas os novos
  fieldErrors.value = {};
  const errorMessages = [];

  // Registra o erro no campo e na notificação (regras puras em utils/validation.js)
  const collectError = (fieldKey, label, message) => {
    if (!message) return;
    fieldErrors.value[fieldKey] = message;
    errorMessages.push(label);
  };

  collectError('name', 'Título', validateRequired(formData.name, 'Título'));
  collectError('author', 'Autor', validateRequired(formData.author, 'Autor'));
  collectError(
    'totalPages',
    'Total de páginas',
    validatePositiveNumber(formData.totalPages, 'Total de páginas'),
  );

  collectError(
    'currentPage',
    'Página atual',
    validatePositiveNumber(formData.currentPage, 'Página atual'),
  );
  if (
    !fieldErrors.value.currentPage &&
    formData.currentPage &&
    formData.totalPages &&
    Number(formData.currentPage) > Number(formData.totalPages)
  ) {
    collectError('currentPage', 'Página atual', 'Página atual não pode ser maior que o total');
  }

  const yearError = validateYear(formData.firstPublished, 'Ano');
  if (yearError) {
    collectError('firstPublished', 'Ano de publicação', yearError);
  } else if (formData.firstPublished) {
    const currentYear = new Date().getFullYear();
    if (
      Number(formData.firstPublished) < 1000 ||
      Number(formData.firstPublished) > currentYear + 1
    ) {
      collectError(
        'firstPublished',
        'Ano de publicação',
        `Ano deve estar entre 1000 e ${currentYear + 1}`,
      );
    }
  }

  // O schema exige inteiro positivo; string vazia viraria 400 da API
  if (formData.seriesInfo.volume !== '') {
    collectError('volume', 'Volume', validatePositiveInteger(formData.seriesInfo.volume, 'Volume'));
  }

  if (formData.startDate && formData.endDate) {
    collectError(
      'endDate',
      'Data de término',
      validateDateRange(formData.startDate, formData.endDate),
    );
  }

  // Só mostra notificação se houver erros
  if (errorMessages.length > 0) {
    addNotification(`Corrija: ${errorMessages.join(', ')}`, 'error');
    return;
  }

  isSubmitting.value = true;

  try {
    // Montar startEnd corretamente (objeto com datas ISO 8601)
    let startEndValue = undefined;
    if (formData.startDate || formData.endDate) {
      if (formData.startDate && formData.endDate) {
        startEndValue = {
          start: formData.startDate,
          end: formData.endDate,
          timeZone: null,
        };
      } else {
        startEndValue = {
          start: formData.startDate || formData.endDate,
          timeZone: null,
        };
      }
    }

    const bookData = {
      title: formData.name.trim(),
      author: parseCommaSeparated(formData.author),
      status: formData.status || undefined,
      rate: formData.rate || undefined,
      // pages e seriesInfo seguem o contrato agrupado do backend
      pages: {
        totalPages: formData.totalPages ? Number(formData.totalPages) : undefined,
        currentlyPage: formData.currentPage ? Number(formData.currentPage) : undefined,
      },
      type: parseCommaSeparated(formData.type)[0] || undefined,
      firstPublished: formData.firstPublished || undefined,
      iHaveCopy: formData.iHaveCopy,
      wasReadIn: parseCommaSeparated(formData.wasReadIn),
      startEnd: startEndValue,
      coverUrl: formData.coverUrl?.trim() || undefined,
      literaryAtlas: formData.literaryAtlas || undefined,
      genres: formData.genres,
      publishedBy: formData.publishedBy.trim() || undefined,
      // String vazia e null são aceitos: o backend traduz para { select: null },
      // que é como o Notion limpa a propriedade
      seriesInfo: {
        bookSeries: formData.seriesInfo.bookSeries.trim(),
        volume: formData.seriesInfo.volume === '' ? null : Number(formData.seriesInfo.volume),
      },
    };

    // Se tem ID na rota: atualiza. Senão: cria um novo livro
    if (props.isEdit && props.book) {
      await bookStore.updateBook(props.book.id, bookData);
      addNotification('Livro atualizado com sucesso!', 'success');
      emit('edit-success', props.book.id);
    } else {
      await bookStore.createBook(bookData);
      addNotification('Livro criado com sucesso!', 'success');
    }

    // Após criar, limpa os campos. Na edição mantém os valores.
    if (!props.isEdit) {
      resetFormData();
    }
  } catch {
    addNotification(`Erro ao ${props.isEdit ? 'atualizar' : 'criar'} livro`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// Volta para a página anterior sem salvar
const handleCancel = () => {
  // Na criação limpa os dados; na edição o livro permanece intacto
  if (!props.isEdit) {
    resetFormData();
  }

  emit('cancel');
};
</script>

<template>
  <div class="book-form">
    <form @submit.prevent="handleSubmit" class="book-form__content">
      <!-- Layout: 30% Cover | 70% Campos -->
      <div class="book-form__layout">
        <!-- Coluna Cover (30%) -->
        <div class="book-form__cover-section">
          <div class="book-form__cover-container">
            <BookCover
              :src="coverUrl ?? ''"
              alt="Capa do livro"
              label="Sem capa"
              class="book-form__cover-image"
            />
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
          <FormSection :title="BOOK_FORM_SECTIONS.basicInfo.title">
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

            <div class="book-form__grid">
              <FormField
                v-model="formData.seriesInfo.bookSeries"
                label="Série do livro"
                type="autocomplete"
                :options="seriesOptions"
                placeholder="Digite ou selecione"
                :error="fieldErrors.bookSeries"
              />

              <FormField
                v-model="formData.seriesInfo.volume"
                label="Volume"
                type="number"
                placeholder="Ex: 2"
                :error="fieldErrors.volume"
              />
            </div>
          </FormSection>

          <!-- Status e Progresso -->
          <FormSection :title="BOOK_FORM_SECTIONS.statusProgress.title">
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
                v-if="isKindle && formData.status === BOOK_STATUS_MAP.READING"
                v-model="formData.kindleProgress"
                label="Progresso Kindle (%)"
                type="number"
                placeholder="Ex: 75"
                :error="fieldErrors.kindleProgress"
              />

              <FormField
                v-if="formData.status === BOOK_STATUS_MAP.READING"
                v-model="formData.currentPage"
                label="Página atual"
                type="number"
                placeholder="Ex: 125"
                :error="fieldErrors.currentPage"
              />
            </div>
          </FormSection>

          <!-- Avaliação e Classificação -->
          <FormSection :title="BOOK_FORM_SECTIONS.classification.title">
            <div class="book-form__grid">
              <FormField
                v-if="formData.status === BOOK_STATUS_MAP.READ"
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
          <FormSection :title="BOOK_FORM_SECTIONS.publication.title">
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

              <div class="book-form__checkbox-field" v-if="formData.type === 'Paper'">
                <FormField
                  v-model="formData.iHaveCopy"
                  label="Possuo cópia física"
                  type="checkbox"
                />
              </div>
            </div>
          </FormSection>

          <FormSection :title="BOOK_FORM_SECTIONS.readingMeta.title">
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
        :submit-text="BOOK_FORM_ACTIONS.submit"
        :cancel-text="BOOK_FORM_ACTIONS.cancel"
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
  border-radius: var(--radius-lg);
  overflow: hidden;
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
  grid-template-columns: 20% 80%;
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
  border-radius: var(--radius);
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px rgba(218, 147, 143, 0.05);
}

.book-form__cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
