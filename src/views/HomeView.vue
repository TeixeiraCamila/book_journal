<script setup>
// View legado — atualmente não usada como rota principal (substituída por CardStackView)
import BookList from '@/components/BookList.vue';
import Filters from '@/components/navigation/Filters.vue';
</script>

<template>
  <div class="home-view">
    <Filters />
    <BookList />
  </div>
</template>

<style scoped></style>
