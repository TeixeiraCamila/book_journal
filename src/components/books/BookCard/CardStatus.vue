<script setup>
// Fita de status sobreposta ao card — exibe o status do livro (ex: "To be read", "Reading")
import tape from '@/assets/images/tape_2.webp'
import { BOOK_STATUS_MAP } from '@/constants/book'

import Star from '@/assets/images/star.png'

defineProps({
  bookStatus: { type: String, required: true },
  rotate: { type: String, required: false },
  back: { type: String, required: false },
  book: { type: Object, required: true },
})
</script>

<template>
  <div class="card-status__tape" :style="{ transform: `translateX(-50%) ${rotate || ''}` }">
    <p class="card-status__text">{{ bookStatus }}</p>
    <img width="150" :src="tape" alt="" />
    <div class="card_back__top" v-if="back">
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
  </div>
</template>

<style scoped>
.card-status__tape {
  position: absolute;
  top: -31px;
  left: 50%;
}

.card-status__tape .card-status__text {
  position: absolute;
  top: 40%;
  left: 45%;
  transform: translate(-40%, -50%);
  width: 60%;
  text-align: center;
}
</style>

<style>
.card_back .card-status__tape .card-status__text {
  display: none;
}
</style>
