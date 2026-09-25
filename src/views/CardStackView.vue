// View principal — stack de cards vertical com Swiper (intro, book list, reading, TBR)
<script setup>
import { defineAsyncComponent, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { use_book_store } from '@/stores/bookStore';
import { BOOK_STATUS_MAP } from '@/constants/book';
import CardIntro from '@/components/features/Stack/CardIntro.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

const bookStore = use_book_store();

// Fallback exibido enquanto o chunk de cada lista é baixado (evita slide em branco)
const async_slide = (loader) =>
  defineAsyncComponent({
    loader,
    loadingComponent: LoadingSpinner,
    delay: 200,
  });

// Componentes carregados sob demanda para otimizar performance inicial
const BookList = async_slide(() => import('@/components/books/BookList/BookList.vue'));
const TBRList = async_slide(() => import('@/components/features/TBRList/TBRList.vue'));
const ReadingList = async_slide(() => import('@/components/features/ReadingList/ReadingList.vue'));
const ThisYearList = async_slide(
  () => import('@/components/features/ThisYearList/ThisYearList.vue'),
);

// Swiper.js — biblioteca de slides com efeito de cards empilhados (vertical)
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

const route = useRoute();
const swiper_instance = ref(null);
const modules = [EffectCards];

function on_swiper_init(swiper) {
  swiper_instance.value = swiper;
}

// Ao mudar de slide, pré-carrega dados dos próximos cards (leitura adiada)
const on_slide_change = (swiper) => {
  const active_index = swiper.activeIndex;

  if (active_index === 1) {
    bookStore.fetch_books_by_status();
    bookStore.fetch_books_by_status(undefined, BOOK_STATUS_MAP.READING);
    prefetch_next_slides([2, 3, 4]);
  }
  if (active_index === 2) {
    bookStore.fetch_books_read_this_year();
    prefetch_next_slides([3]);
  }
  if (active_index === 3) {
    prefetch_next_slides([4]);
  }
};

// Pré-carrega chunks de componentes em produção para navegação instantânea
function prefetch_next_slides(slide_indices) {
  if (import.meta.env.PROD) {
    slide_indices.forEach((index) => {
      trigger_chunk_prefetch(index);
    });
  }
}

function trigger_chunk_prefetch(slide_index) {
  const chunks = {
    1: () => import('@/components/books/BookList/BookList.vue'),
    2: () => import('@/components/features/ReadingList/ReadingList.vue'),
    3: () => import('@/components/features/ThisYearList/ThisYearList.vue'),
    4: () => import('@/components/features/TBRList/TBRList.vue'),
  };

  const loader = chunks[slide_index];
  if (loader) {
    loader().catch(() => {});
  }
}

// Na montagem, pré-carrega slides e verifica se há slide alvo via query string
onMounted(() => {
  setTimeout(() => {
    prefetch_next_slides([1, 2, 3, 4]);
  }, 1500);

  const slide_target = route.query.slide;
  if (slide_target) {
    const target = Number(slide_target);
    if (target >= 2) {
      bookStore.fetch_books_by_status();
      bookStore.fetch_books_by_status(undefined, BOOK_STATUS_MAP.READING);
    }
    if (target >= 3) {
      bookStore.fetch_books_read_this_year();
    }
    nextTick(() => {
      swiper_instance.value?.slideTo(target, 300);
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
    @swiper="on_swiper_init"
    @slideChange="on_slide_change"
  >
    <SwiperSlide class="stack-view__slide">
      <CardIntro class="stack-view__card stack-view__intro" />
    </SwiperSlide>

    <SwiperSlide class="stack-view__slide">
      <div class="stack-view__card stack-view__book-list">
        <BookList />
      </div>
    </SwiperSlide>

    <SwiperSlide class="stack-view__slide" v-if="bookStore.book_lists.reading.length">
      <div class="stack-view__card stack-view__now">
        <ReadingList />
      </div>
    </SwiperSlide>

    <SwiperSlide class="stack-view__slide" v-if="bookStore.this_year_count > 0">
      <div class="stack-view__card stack-view__year">
        <ThisYearList />
      </div>
    </SwiperSlide>

    <SwiperSlide class="stack-view__slide" v-if="bookStore.book_lists.tbr.length">
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
  border-radius: var(--radius-lg);
}
.stack-view__card {
  width: 100%;
  height: 100%;
  padding: 2rem;
  
}
.stack-view__card {
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
.stack-view__intro.stack-view__card {
  background: url('../assets/images/cards/card_bg/bg__green.webp');
}

.stack-view__card.stack-view__book-list {
  background: url('../assets/images/cards/card_bg/bg__blue.webp');
}

.stack-view__card.stack-view__now {
  background: url('../assets/images/cards/card_bg/bg__red.webp');
}

.stack-view__card.stack-view__year {
  background: url('../assets/images/cards/card_bg/bg__yellow.webp');
}

.stack-view__card.stack-view__tbr {
  background: url('../assets/images/cards/card_bg/bg__pink.webp');
}

/* Card da lista de livros com background */
.stack-view__book-list {
  /* background-image: url('../assets/images/cards/card_bg/bg__blue.webp'); */
  background-position: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stack-view__tbr {
  /* background-image: url('../assets/images/cards/card_bg/bg__pink.webp'); */
}

.stack-view__now {
  /* background-image: url('../assets/images/cards/card_bg/bg__red.webp'); */
}
.stack-view__year {
  /* background-image: url('../assets/images/cards/card_bg/bg__yellow.webp'); */
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
