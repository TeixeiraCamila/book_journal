<script setup>
// Fita de status sobreposta ao card — exibe o status do livro (ex: "To be read", "Reading")
import tape from '@/assets/images/blue_tape.webp';
import { BOOK_STATUS_MAP } from '@/constants/book';

import Star from '@/assets/images/star.png';

defineProps({
  bookStatus: { type: String, required: true },
  rotate: { type: String, required: false },
  back: { type: String, required: false },
  book: { type: Object, required: true },
  // Variante compacta para cards menores (ex.: ThisYearList)
  tight: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="card-status__tape"
    :class="{ 'card-status--tight': tight }"
    :style="{ transform: `translateX(-50%) ${rotate || ''}` }"
  >
    <p class="card-status__text">{{ bookStatus }}</p>
    <img width="130" :src="tape" alt="" />
    <div class="card_back__top" v-if="back">
      <p class="card_back__rate" v-if="book.status === BOOK_STATUS_MAP.READ && book.rate">
        <img
          v-for="(rate, i) in book.rate"
          :key="i"
          height="15"
          width="15"
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

/* Variante compacta: fita mais baixa, texto menor e imagem reduzida */
.card-status__tape.card-status--tight {
  top: -15%;
  z-index: 1;
}

.card-status--tight .card-status__text {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--black);
  text-transform: uppercase;
  line-height: 1.2;
}

.card-status--tight > img {
  max-width: 100px;
}
</style>

<style>
.card_back .card-status__tape .card-status__text {
  display: none;
}
</style>
