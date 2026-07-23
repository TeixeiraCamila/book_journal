<script setup>
// Face posterior do card — detalhes do livro, metadados e botões de ação (editar/deletar)
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { BOOK_TYPE_LABELS, BOOK_STATUS_MAP } from '@/constants/book'
import CardStatus from './CardStatus.vue'
import Button from '@/components/ui/Button.vue'
import { PencilLine, Trash } from 'lucide-vue-next'

import Star from '@/assets/images/star.png'

const props = defineProps({
  book: { type: Object, required: true },
  rotate: { type: String, required: false },
})

const emit = defineEmits(['edit', 'delete'])

const userStore = useUserStore()

const string = computed(() => {
  const publisher = props.book.publishedBy?.[0]
  const year = props.book.firstPublished

  if (publisher && year) {
    return `Published by ${publisher} in ${year}`
  }

  if (publisher) {
    return `Published by ${publisher}`
  }

  if (year) {
    return `First published in ${year}`
  }

  return ''
})

const wasReadString = computed(() => {
  if (!props.book.wasReadIn?.length) return ''
  return props.book.wasReadIn.join(', ')
})

const typeString = computed(() => {
  if (!props.book.type?.length) return ''
  return props.book.type.map((t) => BOOK_TYPE_LABELS[t] || t).join(', ')
})

const handleEdit = () => {
  emit('edit', props.book)
}

const handleDelete = () => {
  emit('delete', props.book)
}
</script>

<template>
  <div class="card_back">
    <CardStatus :rotate="rotate" :book-status="book.status" />
    <div class="card_back__content">
      <div class="card_back__top">
        <p class="card_back__rate" v-if="book.status === BOOK_STATUS_MAP.READ && book.rate">
          <img
            v-for="(rate, i) in book.rate"
            :key="i"
            height="20"
            width="20"
            :src="Star"
            alt="star"
            class="card_back__rate-star"
          />
        </p>
      </div>

      <div class="card_back__info">
        <div class="card_back__label">
          <h4 class="card_back__title">{{ book.name }}</h4>
        </div>

        <p class="card_back__text" v-if="book.bookSeries">Série: {{ book.bookSeries }}</p>

        <p class="card_back__text" v-if="book.author?.length">
          <span v-if="book.literaryAtlas" v-html="book.literaryAtlas" />
          {{ book.author.join(', ') }}
        </p>

        <div v-if="book.total && book.currentlyOn">
          <p class="card_back__text">Páginas: {{ book.currentlyOn }} / {{ book.totalPages }}</p>
          <p class="card_back__text">Progresso: {{ book.currentlyOn }} / {{ book.total }}</p>
        </div>

        <p class="card_back__text" v-if="typeString">Tipo: {{ typeString }}</p>

        <p class="card_back__text" v-if="string">
          {{ string }}
        </p>

        <p class="card_back__text" v-if="wasReadString">Lido em: {{ wasReadString }}</p>

        <ul class="card_back__genres">
          <li v-for="(genre, index) in book.genres" :key="index" class="card_back__genre">
            {{ genre }}
          </li>
        </ul>
      </div>

      <div class="card_back__actions" v-if="!userStore.isGuest">
        <Button class="card_back__action-btn" @click="handleEdit" variant="secondary">
          <PencilLine />
        </Button>
        <Button class="card_back__action-btn" @click="handleDelete" variant="secondary">
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
  border-radius: 0.75rem;
}

.card_back__actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.card_back__actions .card_back__action-btn {
  background-color: transparent;
  border: none;
  padding: 4px;
  border-radius: 0.75rem;
  cursor: pointer;
  color: var(--black);
}

.card_back__actions .card_back__action-btn:hover {
  background-color: var(--accent_muted);
}
</style>
