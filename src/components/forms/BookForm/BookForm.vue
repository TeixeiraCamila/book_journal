<script setup>
// Formulário de criação/edição de livros — validação, hidratação e envio para API
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { use_book_store } from '@/stores/bookStore';
import {
  BOOK_STATUS_FALLBACK,
  BOOK_RATE_LABELS,
  BOOK_TYPES_FALLBACK,
  BOOK_STATUS_MAP,
} from '@/constants/book';

import { parse_comma_separated } from '@/utils/validation';
import { use_notifications } from '@/composables/useNotifications';
import FormSection from '@/components/forms/FormSection.vue';
import FormField from '@/components/forms/FormField.vue';
import FormActions from '@/components/forms/FormActions.vue';

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

const emit = defineEmits(['cancel', 'submit', 'edit-success']);
const bookStore = use_book_store();
const { add_notification } = use_notifications();

const form_data = reactive({
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
  kindleProgress: '',
});

// Armazena erros de validação de cada campo
const field_errors = ref({});
// Impede múltiplos envios enquanto a requisição está em andamento
const is_submitting = ref(false);

// Opções carregadas do Notion via API, com fallback para valores locais
const status_options = computed(() => bookStore.book_options?.Status || BOOK_STATUS_FALLBACK);
const rate_options = computed(() =>
  bookStore.book_options?.Rate
    ? Object.keys(BOOK_RATE_LABELS).filter((r) => bookStore.book_options.Rate.includes(r))
    : Object.keys(BOOK_RATE_LABELS),
);
const type_options = computed(() => bookStore.book_options?.Type || BOOK_TYPES_FALLBACK);
const atlas_options = computed(() => bookStore.book_options?.Atlas || []);
const series_options = computed(() => bookStore.book_options?.['Book Series Name'] || []);
const published_year_options = computed(() =>
  (bookStore.book_options?.['First published in'] || []).filter((y) => y !== '0000'),
);
const author_options = computed(() => bookStore.book_options?.Author || []);
const was_read_in_options = computed(() => bookStore.book_options?.['Was read in'] || []);
const genres_options = computed(() => bookStore.book_options?.Tags || []);
const published_by_options = computed(() => bookStore.book_options?.['Published by'] || []);
const quest_options = computed(() => bookStore.book_options?.Quest || []);

// Retorna null se vazio para não quebrar a exibição da capa
const cover_url = computed(() => {
  if (form_data.coverUrl) {
    return form_data.coverUrl.trim() || null;
  }
  return null;
});

const is_kindle = computed(() => form_data.type?.includes('Kindle'));

watch([() => form_data.kindleProgress, () => form_data.totalPages], ([progress, total]) => {
  if (progress && total && Number(progress) > 0 && Number(total) > 0) {
    form_data.currentlyOn = Math.round((Number(total) * Number(progress)) / 100);
  }
});

// Carrega as opções do Notion na montagem,
// depois preenche o formulário se for edição
onMounted(async () => {
  if (!bookStore.book_options) {
    await bookStore.fetch_book_options();
  }

  if (props.book && props.isEdit) {
    hydrate_form(props.book);
  }
});

// Função auxiliar para parsing robusto de startEnd
const parse_start_end_data = (start_end_data) => {
  if (!start_end_data) {
    form_data.startDate = '';
    form_data.endDate = '';
    return;
  }

  try {
    if (typeof start_end_data === 'object' && start_end_data !== null) {
      form_data.startDate = start_end_data.start || '';
      form_data.endDate = start_end_data.end || '';
    } else if (typeof start_end_data === 'string' && start_end_data.includes('/')) {
      const [start, end] = start_end_data.split('/');
      form_data.startDate = start?.trim() || '';
      form_data.endDate = end?.trim() || '';
    } else if (typeof start_end_data === 'string') {
      form_data.startDate = start_end_data || '';
      form_data.endDate = '';
    } else if (Array.isArray(start_end_data)) {
      form_data.startDate = start_end_data[0] || '';
      form_data.endDate = start_end_data[1] || '';
    } else {
      form_data.startDate = '';
      form_data.endDate = '';
    }
  } catch {
    form_data.startDate = '';
    form_data.endDate = '';
  }
};

// Função auxiliar para preencher form_data a partir de um livro
const hydrate_form = (book) => {
  if (!book) return;

  form_data.name = book.name || '';
  form_data.author = book.author?.join(', ') || '';
  form_data.status = book.status || '';
  form_data.rate = book.rate || '';
  form_data.totalPages = book.totalPages || '';
  form_data.currentlyOn = book.currentlyOn || '';
  form_data.type = book.type?.join(', ') || '';
  form_data.firstPublished = book.firstPublished || '';
  form_data.iHaveCopy = book.iHaveCopy || false;
  form_data.wasReadIn = book.wasReadIn?.join(', ') || '';
  form_data.coverUrl = book.cover?.[0] || '';
  form_data.literaryAtlas = book.literaryAtlas || '';
  form_data.genres = book.genres || [];
  form_data.publishedBy = book.publishedBy?.join(', ') || '';
  form_data.bookSeries = book.bookSeries || '';
  form_data.quest = book.quest || [];

  form_data.kindleProgress = '';

  parse_start_end_data(book.startEnd);
};

// Watch para atualizar o form quando o livro mudar (caso o book seja carregado assíncronamente)
watch(
  () => props.book,
  (new_book) => {
    if (new_book && props.isEdit) {
      hydrate_form(new_book);
    }
  },
  { immediate: true },
);

// Auto-setar status para Read e wasReadIn quando endDate for preenchido
watch(
  () => form_data.endDate,
  (new_end_date) => {
    if (!new_end_date) return;

    if (form_data.status !== BOOK_STATUS_MAP.READ) {
      form_data.status = BOOK_STATUS_MAP.READ;
    }

    if (!form_data.wasReadIn) {
      const year = new Date(new_end_date).getFullYear();
      if (!isNaN(year)) {
        form_data.wasReadIn = String(year);
      }
    }
  },
);

const reset_form_data = () => {
  Object.keys(form_data).forEach((key) => {
    if (typeof form_data[key] === 'boolean') form_data[key] = false;
    else if (Array.isArray(form_data[key])) form_data[key] = [];
    else form_data[key] = '';
  });
};

// Valida campos, monta o objeto e envia para a API via store
const handle_submit = async () => {
  // Reinicia os erros e a lista para exibir apenas os novos
  field_errors.value = {};
  const error_messages = [];

  if (!form_data.name || !form_data.name.trim()) {
    field_errors.value.name = 'Título é obrigatório';
    error_messages.push('Título');
  }

  if (!form_data.author || !form_data.author.trim()) {
    field_errors.value.author = 'Autor é obrigatório';
    error_messages.push('Autor');
  }

  if (form_data.totalPages) {
    if (isNaN(form_data.totalPages) || form_data.totalPages < 0) {
      field_errors.value.totalPages = 'Total de páginas deve ser um número positivo';
      error_messages.push('Total de páginas');
    }
  }

  if (form_data.currentlyOn) {
    if (isNaN(form_data.currentlyOn) || form_data.currentlyOn < 0) {
      field_errors.value.currentlyOn = 'Página atual deve ser um número positivo';
      error_messages.push('Página atual');
    } else if (
      form_data.totalPages &&
      Number(form_data.currentlyOn) > Number(form_data.totalPages)
    ) {
      field_errors.value.currentlyOn = 'Página atual não pode ser maior que o total';
      error_messages.push('Página atual');
    }
  }

  // Validação de ano (opcional - só valida se preenchido)
  if (form_data.firstPublished) {
    const current_year = new Date().getFullYear();
    if (!/^\d{4}$/.test(form_data.firstPublished)) {
      field_errors.value.firstPublished = 'Ano deve ter 4 dígitos';
      error_messages.push('Ano de publicação');
    } else if (
      Number(form_data.firstPublished) < 1000 ||
      Number(form_data.firstPublished) > current_year + 1
    ) {
      field_errors.value.firstPublished = `Ano deve estar entre 1000 e ${current_year + 1}`;
      error_messages.push('Ano de publicação');
    }
  }

  // Validação de datas (opcional - só valida se ambas preenchidas)
  if (form_data.startDate && form_data.endDate) {
    const start = new Date(form_data.startDate);
    const end = new Date(form_data.endDate);

    if (start > end) {
      field_errors.value.endDate = 'Data de término deve ser posterior à data de início';
      error_messages.push('Data de término');
    }
  }

  // Só mostra notificação se houver erros
  if (error_messages.length > 0) {
    add_notification(`Corrija: ${error_messages.join(', ')}`, 'error');
    return;
  }

  is_submitting.value = true;

  try {
    // Montar startEnd corretamente (objeto com datas ISO 8601)
    let start_end_value = undefined;
    if (form_data.startDate || form_data.endDate) {
      if (form_data.startDate && form_data.endDate) {
        start_end_value = {
          start: form_data.startDate,
          end: form_data.endDate,
          time_zone: null,
        };
      } else {
        start_end_value = {
          start: form_data.startDate || form_data.endDate,
          time_zone: null,
        };
      }
    }

    const book_data = {
      name: form_data.name.trim(),
      author: parse_comma_separated(form_data.author),
      status: form_data.status || undefined,
      rate: form_data.rate || undefined,
      totalPages: form_data.totalPages ? Number(form_data.totalPages) : undefined,
      currentlyOn: form_data.currentlyOn ? Number(form_data.currentlyOn) : undefined,
      type: parse_comma_separated(form_data.type)[0] || undefined,
      firstPublished: form_data.firstPublished || undefined,
      iHaveCopy: form_data.iHaveCopy,
      wasReadIn: parse_comma_separated(form_data.wasReadIn),
      startEnd: start_end_value,
      coverUrl: form_data.coverUrl?.trim() || undefined,
      literaryAtlas: form_data.literaryAtlas || undefined,
      genres: form_data.genres,
      publishedBy: parse_comma_separated(form_data.publishedBy),
      bookSeries: form_data.bookSeries || undefined,
      quest: form_data.quest,
    };

    // Se tem ID na rota: atualiza. Senão: cria um novo livro
    if (props.isEdit && props.book) {
      await bookStore.update_book(props.book.id, book_data);
      add_notification('Livro atualizado com sucesso!', 'success');
      emit('edit-success', props.book.id);
    } else {
      await bookStore.create_book(book_data);
      add_notification('Livro criado com sucesso!', 'success');
    }

    // Após criar, limpa os campos. Na edição mantém os valores.
    if (!props.isEdit) {
      reset_form_data();
    }

    emit('submit');
  } catch {
    add_notification(`Erro ao ${props.isEdit ? 'atualizar' : 'criar'} livro`, 'error');
  } finally {
    is_submitting.value = false;
  }
};

// Volta para a página anterior sem salvar
const handle_cancel = () => {
  // Na criação limpa os dados; na edição o livro permanece intacto
  if (!props.isEdit) {
    reset_form_data();
  }

  emit('cancel');
};
</script>

<template>
  <div class="book-form">
    <form @submit.prevent="handle_submit" class="book-form__content">
      <!-- Layout: 30% Cover | 70% Campos -->
      <div class="book-form__layout">
        <!-- Coluna Cover (30%) -->
        <div class="book-form__cover-section">
          <div class="book-form__cover-container">
            <img
              v-if="cover_url"
              :src="cover_url"
              alt="Capa do livro"
              class="book-form__cover-image"
            />
            <div v-else class="book-form__cover-placeholder">
              <span>📖</span>
              <p>Sem capa</p>
            </div>
          </div>

          <FormField
            v-model="form_data.coverUrl"
            label="URL da Capa"
            placeholder="Cole a URL da imagem"
            :error="field_errors.coverUrl"
          />
        </div>

        <!-- Coluna Campos (70%) -->
        <div class="book-form__fields">
          <!-- Informações Básicas -->
          <FormSection title="Informações Básicas">
            <div class="book-form__grid">
              <FormField
                v-model="form_data.name"
                label="Título"
                placeholder="Ex: 1984"
                required
                :error="field_errors.name"
              />

              <FormField
                v-model="form_data.author"
                label="Autor"
                type="autocomplete"
                :options="author_options"
                placeholder="Digite ou selecione"
                required
                :error="field_errors.author"
              />
            </div>

            <div class="book-form__grid">
              <FormField
                v-model="form_data.bookSeries"
                label="Série do livro"
                type="autocomplete"
                :options="series_options"
                placeholder="Digite ou selecione"
                :error="field_errors.bookSeries"
              />
              <FormField
                v-model="form_data.quest"
                label="Quest"
                type="multi-select"
                :options="quest_options"
                placeholder="Digite ou selecione"
                :error="field_errors.quest"
              />
            </div>
          </FormSection>

          <!-- Status e Progresso -->
          <FormSection title="Status e Progresso">
            <div class="book-form__grid">
              <FormField
                v-model="form_data.status"
                label="Status"
                type="select"
                :options="status_options"
                :error="field_errors.status"
              />

              <FormField
                v-model="form_data.totalPages"
                label="Total de páginas"
                type="number"
                placeholder="Ex: 350"
                :error="field_errors.totalPages"
              />

              <FormField
                v-if="is_kindle && form_data.status === BOOK_STATUS_MAP.READING"
                v-model="form_data.kindleProgress"
                label="Progresso Kindle (%)"
                type="number"
                placeholder="Ex: 75"
                :error="field_errors.kindleProgress"
              />

              <FormField
                v-if="form_data.status === BOOK_STATUS_MAP.READING"
                v-model="form_data.currentlyOn"
                label="Página atual"
                type="number"
                placeholder="Ex: 125"
                :error="field_errors.currentlyOn"
              />
            </div>
          </FormSection>

          <!-- Avaliação e Classificação -->
          <FormSection title="Avaliação e Classificação">
            <div class="book-form__grid">
              <FormField
                v-if="form_data.status === BOOK_STATUS_MAP.READ"
                v-model="form_data.rate"
                label="Avaliação"
                type="select"
                :options="rate_options"
                :labels="BOOK_RATE_LABELS"
                placeholder="Selecione uma avaliação"
                :error="field_errors.rate"
              />

              <FormField
                v-model="form_data.type"
                label="Tipo"
                type="select"
                :options="type_options"
                placeholder="Selecione o tipo"
                :error="field_errors.type"
              />

              <FormField
                v-model="form_data.genres"
                label="Gêneros/Tags"
                type="multi-select"
                :options="genres_options"
                placeholder="Digite ou selecione"
                :error="field_errors.genres"
              />
            </div>
          </FormSection>

          <!-- Detalhes da Publicação -->
          <FormSection title="Detalhes da Publicação">
            <div class="book-form__grid">
              <FormField
                v-model="form_data.firstPublished"
                label="Ano de publicação"
                type="autocomplete"
                :options="published_year_options"
                placeholder="Digite ou selecione"
                :error="field_errors.firstPublished"
              />

              <FormField
                v-model="form_data.publishedBy"
                label="Publicado por"
                type="autocomplete"
                :options="published_by_options"
                placeholder="Digite ou selecione"
                :error="field_errors.publishedBy"
              />

              <div class="book-form__checkbox-field" v-if="form_data.type === '📘 Paper'">
                <FormField
                  v-model="form_data.iHaveCopy"
                  label="Possuo cópia física"
                  type="checkbox"
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Leitura e Metadados">
            <div class="book-form__grid">
              <FormField
                v-model="form_data.wasReadIn"
                label="Lido em"
                type="autocomplete"
                :options="was_read_in_options"
                placeholder="Digite ou selecione"
                :error="field_errors.wasReadIn"
              />

              <FormField
                v-model="form_data.startDate"
                label="Data de início"
                type="date"
                :error="field_errors.startDate"
              />

              <FormField
                v-model="form_data.endDate"
                label="Data de término"
                type="date"
                :error="field_errors.endDate"
              />

              <FormField
                v-model="form_data.literaryAtlas"
                label="Atlas literário"
                type="autocomplete"
                :options="atlas_options"
                placeholder="Selecione ou digite"
                :error="field_errors.literaryAtlas"
              />
            </div>
          </FormSection>
        </div>
      </div>

      <!-- Ações -->
      <FormActions
        :is-submitting="is_submitting"
        submit-text="Salvar Livro"
        cancel-text="Cancelar"
        @cancel="handle_cancel"
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
