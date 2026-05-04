<script setup>
import CardStatus from './CardStatus.vue'

const props = defineProps({
  book: { type: Object, required: true },
  rotate: { type: String, required: false },
});
</script>

<template>
  <picture class="card-front">
    <CardStatus :rotate="rotate" :book-status="book.status" />
    <img
      v-if="book.cover"
      class="card-front__image"
      width="100"
      height="150"
      :src="book.cover[0]"
      :alt="book.cover[0]"
      loading="lazy"
      decoding="async"
    />
    <img v-else class="card-front__image" src="https://placehold.co/226x354" :alt="book.name" loading="lazy" />
  </picture>
</template>


