<script setup>
// Face frontal do card — exibe capa do livro com sobreposição de status
import CardStatus from './CardStatus.vue';
import BookCover from '@/components/books/BookCover/BookCover.vue';

defineProps({
  book: { type: Object, required: true },
  rotate: { type: String, required: false },
});
</script>

<template>
  <picture class="card-front">
    <CardStatus :rotate="rotate" :book-status="book.status" />
    <BookCover :src="book.cover?.[0]" :alt="book.title" class="card-front__image" />
  </picture>
</template>

<style>
.card-front__image {
  width: 100%;
  height: 100%;
}
</style>
