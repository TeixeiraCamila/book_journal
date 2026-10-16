<script setup>
import { computed, defineAsyncComponent, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useBookStore } from '@/stores/bookStore';
import { BOOK_STATUS_MAP } from '@/constants/book';
import CardIntro from '@/components/features/Stack/CardIntro.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

const bookStore = useBookStore();
const route = useRoute();

const swiperInstance = ref(null);
const modules = [EffectCards];

// Ordem lógica dos slides
const LOGICAL_SLIDES = [
  { id: 'intro', type: 'intro' },
  { id: 'books', type: 'books' },
  { id: 'reading', type: 'reading' },
  { id: 'year', type: 'year' },
  { id: 'tbr', type: 'tbr' },
];

// Slides visíveis com base nas condições atuais
const visibleSlides = computed(() => {
  return LOGICAL_SLIDES.filter((slide) => {
    if (slide.type === 'intro') return true;
    if (slide.type === 'books') return true;
    if (slide.type === 'reading') return bookStore.bookLists.reading.length > 0;
    if (slide.type === 'year') return bookStore.thisYearCount > 0;
    if (slide.type === 'tbr') return bookStore.bookLists.tbr.length > 0;
    return false;
  });
});

// Mapeia índice renderizado (Swiper) → tipo lógico visível
function getActiveLogicalType(activeIndex) {
  const visible = visibleSlides.value;
  return visible[activeIndex]?.type ?? null;
}

// Próximos tipos lógicos visíveis a partir de um tipo
function getNextVisibleTypes(fromType) {
  const visible = visibleSlides.value;
  const fromIndex = visible.findIndex((s) => s.type === fromType);
  if (fromIndex < 0) return [];
  return visible.slice(fromIndex + 1).map((s) => s.type);
}

// Loaders puros dos componentes para reuso (evita duplicação)
// defineAsyncComponent + loader = "carrega quando for renderizado" (lazy loading + UX de loading)
// chamar import() direto = "carrega agora, para já estar pronto quando for renderizado" (prefetch/warm-up)
const componentLoaders = {
  books: () => import('@/components/books/BookList/BookList.vue'),
  reading: () => import('@/components/features/ReadingList/ReadingList.vue'),
  year: () => import('@/components/features/ThisYearList/ThisYearList.vue'),
  tbr: () => import('@/components/features/TBRList/TBRList.vue'),
};

// Registry tipo → componente assíncrono (cada import() gera seu chunk no build)
const listComponents = Object.fromEntries(
  Object.entries(componentLoaders).map(([type, loader]) => [
    type,
    defineAsyncComponent({ loader, loadingComponent: LoadingSpinner, delay: 200 }),
  ]),
);

// Modificador de cor de card por tipo lógico (espelha os estilos .stack-view__*)
const SLIDE_CARD_MODIFIERS = {
  books: 'book-list',
  reading: 'now',
  year: 'year',
  tbr: 'tbr',
};

// Pré-carrega chunks para tipos lógicos específicos (apenas em produção)
// import() direto dispara o download antecipado para que o chunk já esteja cacheado
// quando o componente assíncrono for renderizado
function prefetchChunksForTypes(types) {
  if (import.meta.env.PROD) {
    types.forEach((type) => {
      const loader = componentLoaders[type];
      if (loader) {
        loader().catch(() => {});
      }
    });
  }
}

// Carrega as listas pedidas — booleans garantem no máximo 1 fetch por lista
function loadLists({ tbr = false, reading = false, year = false } = {}) {
  if (tbr) bookStore.fetchBooksByStatus();
  if (reading) bookStore.fetchBooksByStatus(undefined, BOOK_STATUS_MAP.READING);
  if (year) bookStore.fetchBooksReadThisYear();
}

// Busca dados necessários ao entrar em determinado tipo de slide
function fetchDataForType(type) {
  const loadsByType = {
    // Lista geral + leituras em andamento ao acessar o card de livros;
    // o slide "year" só existe após thisYearCount > 0 — buscar aqui evita o loop morto
    books: { tbr: true, reading: true, year: true },
    // Garante leituras em andamento e que o slide "year" possa surgir
    // mesmo sem passar pelo slide de livros
    reading: { reading: true, year: true },
    year: { year: true },
  };

  if (loadsByType[type]) loadLists(loadsByType[type]);
}

// Ao inicializar o Swiper
function onSwiperInit(swiper) {
  swiperInstance.value = swiper;
}

// Slides entram/saem conforme os dados chegam; o Swiper precisa recalcular
watch(
  () => visibleSlides.value.length,
  () => {
    nextTick(() => swiperInstance.value?.update());
  },
);

// Ao mudar de slide
function onSlideChange(swiper) {
  const activeType = getActiveLogicalType(swiper.activeIndex);
  if (!activeType) return;

  // Busca dados conforme o tipo ativo
  fetchDataForType(activeType);

  // Pré-carrega chunks dos próximos slides visíveis
  const nextTypes = getNextVisibleTypes(activeType);
  prefetchChunksForTypes(nextTypes);
}

// Pré-carrega chunks dos próximos slides visíveis a partir de um tipo
function prefetchFromType(type) {
  prefetchChunksForTypes(getNextVisibleTypes(type));
}

// Na montagem, pré-carrega slides e verifica se há slide alvo via query string
onMounted(() => {
  // Pré-carregamento dos próximos chunks após o primeiro carregamento
  setTimeout(() => {
    const firstVisible = visibleSlides.value[0]?.type ?? null;
    if (firstVisible) {
      prefetchFromType(firstVisible);
    } else {
      prefetchChunksForTypes(Object.keys(componentLoaders));
    }
  }, 1500);

  const slideTarget = route.query.slide;
  if (slideTarget !== undefined && slideTarget !== null) {
    const targetIndex = Number(slideTarget);

    // Busca dados com base no índice alvo
    loadLists({
      tbr: targetIndex >= 2,
      reading: targetIndex >= 2,
      year: targetIndex >= 3,
    });

    nextTick(() => {
      // Tenta navegar para o índice alvo (respeitando slides renderizados)
      const maxIndex = Math.max(0, visibleSlides.value.length - 1);
      const clamped = Math.min(targetIndex, maxIndex);
      swiperInstance.value?.slideTo(clamped, 300);
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
    <SwiperSlide v-for="slide in visibleSlides" :key="slide.id" class="stack-view__slide">
      <CardIntro v-if="slide.type === 'intro'" class="stack-view__card stack-view__intro" />

      <div
        v-else
        class="stack-view__card"
        :class="`stack-view__${SLIDE_CARD_MODIFIERS[slide.type]}`"
      >
        <component :is="listComponents[slide.type]" />
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
  border-radius: var(--radius-lg);
}

.stack-view__card {
  width: 100%;
  height: 100%;
  padding: 2rem;
}

.stack-view__intro.stack-view__card {
  background-color: #123d17;
}

.stack-view__card.stack-view__book-list {
  background-color: #537d9e;
}

.stack-view__card.stack-view__now {
  background-color: var(--accent4);
}

.stack-view__card.stack-view__year {
  background-color: var(--accent2);
}

.stack-view__card.stack-view__tbr {
  background-color: #e98378;
}

/* Card da lista de livros com background */
.stack-view__book-list {
  background-position: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
