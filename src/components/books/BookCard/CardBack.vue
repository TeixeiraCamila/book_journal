<script setup>
// Face posterior do card — detalhes do livro, metadados e botões de ação (editar/deletar)
import { computed } from 'vue';
import { use_user_store } from '@/stores/userStore';
import { BOOK_TYPE_LABELS } from '@/constants/book';
import CardStatus from './CardStatus.vue';
import Button from '@/components/ui/Button.vue';
import { PencilLine, Trash } from 'lucide-vue-next';

import { use_book_formatters } from '@/composables/useBookFormatters';

const props = defineProps({
  book: { type: Object, required: true },
  rotate: { type: String, required: false },
});

const emit = defineEmits(['edit', 'delete']);

const userStore = use_user_store();

const { get_publication_string } = use_book_formatters();

const string = computed(() => get_publication_string(props.book));

const was_read_string = computed(() => {
  if (!props.book.wasReadIn?.length) return '';
  return props.book.wasReadIn.join(', ');
});

const type_string = computed(() => {
  if (!props.book.type?.length) return '';
  return props.book.type.map((t) => BOOK_TYPE_LABELS[t] || t).join(', ');
});

const handle_edit = () => {
  emit('edit', props.book);
};

const handle_delete = () => {
  emit('delete', props.book);
};
</script>

<template>
  <div class="card_back">
    <CardStatus :rotate="rotate" :book-status="book.status" :back="true" :book="book" />
    <div class="card_back__content">
      <div class="card_back__info">
        <div class="card_back__label">
          <h4 class="card_back__title">{{ book.name }}</h4>
        </div>

        <p class="card_back__text" v-if="book.bookSeries">Série: {{ book.bookSeries }}</p>

        <p class="card_back__text" v-if="book.author?.length">
          <span v-if="book.literaryAtlas" v-html="book.literaryAtlas" />
          {{ book.author.join(', ') }}
        </p>

        <div v-if="book.total && book.currentPage">
          <p class="card_back__text">Páginas: {{ book.currentPage }} / {{ book.totalPages }}</p>
          <p class="card_back__text">Progresso: {{ book.currentPage }} / {{ book.total }}</p>
        </div>

        <p class="card_back__text" v-if="type_string">Tipo: {{ type_string }}</p>

        <p class="card_back__text" v-if="string">
          {{ string }}
        </p>

        <p class="card_back__text" v-if="was_read_string">Lido em: {{ was_read_string }}</p>

        <ul class="card_back__genres">
          <li v-for="(genre, index) in book.genres" :key="index" class="card_back__genre">
            {{ genre }}
          </li>
        </ul>
      </div>

      <div class="card_back__actions" v-if="!userStore.is_guest">
        <Button class="card_back__action-btn" @click="handle_edit" variant="secondary">
          <PencilLine />
        </Button>
        <Button class="card_back__action-btn" @click="handle_delete" variant="secondary">
          <Trash />
        </Button>
      </div>
    </div>
  </div>
</template>

<style>
.card_back__content {
  background-color: var(--white);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: var(--card_back-w);
}

.card_back__top {
  display: flex;
  justify-content: flex-end;
  overflow: hidden;
  position: absolute;
  top: 13px;
  left: 22%;
}

.card_back__info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card_back__title {
  margin: 0;
  font-size: 1rem;
}

.card_back__text {
  font-size: 0.85rem;
}

.card_back__genres {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.card_back__genres .card_back__genre {
  padding: 3px 0.5rem;
  border: 1px solid var(--accent3);
  border-radius: var(--radius);
}

.card_back__actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.card_back__actions .card_back__action-btn.btn {
  background-color: transparent;
  border: none;
  padding: 4px;
  border-radius: var(--radius);
  cursor: pointer;
  color: var(--black);
}

.card_back__actions .card_back__action-btn.btn:hover {
  background-color: var(--accent_muted);
}
</style>
