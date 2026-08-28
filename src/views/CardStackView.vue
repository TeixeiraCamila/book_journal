// View principal — stack de cards vertical com Swiper (intro, book list, reading, TBR)
<script setup>
import { defineAsyncComponent, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useBookStore } from '@/stores/bookStore';
import { BOOK_STATUS_MAP } from '@/constants/book';
import CardIntro from '@/components/features/Stack/CardIntro.vue';

const bookStore = useBookStore();

// Componentes carregados sob demanda para otimizar performance inicial
const BookList = defineAsyncComponent(() => import('@/components/books/BookList/BookList.vue'));
const TBRList = defineAsyncComponent(() => import('@/components/features/TBRList/TBRList.vue'));
const ReadingList = defineAsyncComponent(
  () => import('@/components/features/ReadingList/ReadingList.vue'),
);
const ThisYearList = defineAsyncComponent(
  () => import('@/components/features/ThisYearList/ThisYearList.vue'),
);

// Swiper.js — biblioteca de slides com efeito de cards empilhados (vertical)
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

const route = useRoute();
const swiperInstance = ref(null);
const modules = [EffectCards];

function onSwiperInit(swiper) {
  swiperInstance.value = swiper;
}

// Ao mudar de slide, pré-carrega dados dos próximos cards (leitura adiada)
const onSlideChange = (swiper) => {
  const activeIndex = swiper.activeIndex;

  if (activeIndex === 1) {
    bookStore.fetchBooksByStatus();
    bookStore.fetchBooksByStatus(undefined, BOOK_STATUS_MAP.READING);
    prefetchNextSlides([2, 3, 4]);
  }
  if (activeIndex === 2) {
    bookStore.fetchBooksReadThisYear();
    prefetchNextSlides([3]);
  }
  if (activeIndex === 3) {
    prefetchNextSlides([4]);
  }
};

// Pré-carrega chunks de componentes em produção para navegação instantânea
function prefetchNextSlides(slideIndices) {
  if (import.meta.env.PROD) {
    slideIndices.forEach((index) => {
      triggerChunkPrefetch(index);
    });
  }
}

function triggerChunkPrefetch(slideIndex) {
  const chunks = {
    1: () => import('@/components/books/BookList/BookList.vue'),
    2: () => import('@/components/features/ReadingList/ReadingList.vue'),
    3: () => import('@/components/features/TBRList/TBRList.vue'),
    4: () => import('@/components/features/ThisYearList/ThisYearList.vue'),
  };

  const loader = chunks[slideIndex];
  if (loader) {
    loader().catch(() => {});
  }
}

// Na montagem, pré-carrega slides e verifica se há slide alvo via query string
onMounted(() => {
  setTimeout(() => {
    prefetchNextSlides([1, 2, 3]);
  }, 1500);

  const slideTarget = route.query.slide;
  if (slideTarget) {
    const target = Number(slideTarget);
    if (target >= 2) {
      bookStore.fetchBooksByStatus();
      bookStore.fetchBooksByStatus(undefined, BOOK_STATUS_MAP.READING);
    }
    if (target >= 3) {
      bookStore.fetchBooksReadThisYear();
    }
    nextTick(() => {
      swiperInstance.value?.slideTo(target, 300);
    });
  }
});
</script>

<template>
  <Swiper
    :effect="'cards'"
    :grab-cursor="true"
    :modules="modules"
    :direction="'vertical'"
    class="stack-view__swiper"
    @swiper="onSwiperInit"
    @slideChange="onSlideChange"
  >
    <SwiperSlide class="stack-view__slide">
      <CardIntro class="stack-view__card stack-view__intro" />
    </SwiperSlide>

    <SwiperSlide class="stack-view__slide">
      <div class="stack-view__card stack-view__book-list">
        <BookList />
      </div>
    </SwiperSlide>

    <SwiperSlide class="stack-view__slide" v-if="bookStore.bookLists.reading.length">
      <div class="stack-view__card stack-view__now">
        <ReadingList />
      </div>
    </SwiperSlide>

    <SwiperSlide class="stack-view__slide" v-if="bookStore.thisYearCount > 0">
      <div class="stack-view__card stack-view__year">
        <ThisYearList />
      </div>
    </SwiperSlide>

    <SwiperSlide class="stack-view__slide" v-if="bookStore.bookLists.tbr.length">
      <div class="stack-view__card stack-view__tbr">
        <TBRList />
      </div>
    </SwiperSlide>
  </Swiper>
</template>

<style scoped>
/* Container principal do Swiper */
.stack-view__swiper {
  width: 80vw;
  height: 80vh;
}

/* Slide individual */
.stack-view__slide {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
}

/* Card base dentro do slide */
.stack-view__card {
  width: 100%;
  height: 100%;
  padding: 2rem;
  overflow-y: auto;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  position: relative;
}

/* Card da lista de livros com background */
.stack-view__book-list {
  background-image: url('../assets/images/cards/card_list/bg__blue.webp');
  background-position: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stack-view__tbr {
  background: url('../assets/images/cards/card_list/bg__green__01.webp');
}

.stack-view__now {
  background-image: url('../assets/images/cards/card_this_year/yellow__bg.webp');
}
.stack-view__year {
  background-image: url('../assets/images/cards/card_this_year/yellow__bg.webp');
}
/* ===== RESPONSIVIDADE ===== */
@media (max-width: 768px) {
  .stack-view__swiper {
    width: 95vw;
    height: 90vh;
  }

  .stack-view__card {
    padding: 1rem;
  }
}
</style>
