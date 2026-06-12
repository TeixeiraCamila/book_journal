<script setup>
// Fita de status sobreposta ao card — exibe o status do livro (ex: "To be read", "Reading")
import tape from '@/assets/images/tape.webp'

defineProps({
  bookStatus: { type: String, required: true },
  rotate: { type: String, required: false },
})
</script>

<template>
  <div class="card-status__tape" :style="{ transform: rotate }">
    <p class="card-status__text">{{ bookStatus }}</p>
    <img width="150" :src="tape" alt="" />
  </div>
</template>

<style scoped>
.card-status__tape {
  position: absolute;
  top: -31px;
  left: 11%;
  transform: rotate(-40deg);
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
.card-front .card-status__tape {
  transform: unset;
}

.card-back .card-status__tape .card-status__text {
  display: none;
}
</style>
