<script setup>
import { computed, defineAsyncComponent, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { use_book_store } from '@/stores/bookStore';
import { BOOK_STATUS_MAP } from '@/constants/book';
import CardIntro from '@/components/features/Stack/CardIntro.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';

import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';

const bookStore = use_book_store();
const route = useRoute();

const swiper_instance = ref(null);
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
const visible_slides = computed(() => {
  return LOGICAL_SLIDES.filter((slide) => {
    if (slide.type === 'intro') return true;
    if (slide.type === 'books') return true;
    if (slide.type === 'reading') return bookStore.book_lists.reading.length > 0;
    if (slide.type === 'year') return bookStore.this_year_count > 0;
    if (slide.type === 'tbr') return bookStore.book_lists.tbr.length > 0;
    return false;
  });
});

// Mapeia índice renderizado (Swiper) → tipo lógico visível
function get_active_logical_type(active_index) {
  const visible = visible_slides.value;
  return visible[active_index]?.type ?? null;
}

// Próximos tipos lógicos visíveis a partir de um tipo
function get_next_visible_types(from_type) {
  const visible = visible_slides.value;
  const from_index = visible.findIndex((s) => s.type === from_type);
  if (from_index < 0) return [];
  return visible.slice(from_index + 1).map((s) => s.type);
}

// Loaders puros dos componentes para reuso (evita duplicação)
// defineAsyncComponent + loader = "carrega quando for renderizado" (lazy loading + UX de loading)
// chamar import() direto = "carrega agora, para já estar pronto quando for renderizado" (prefetch/warm-up)
const component_loaders = {
  books: () => import('@/components/books/BookList/BookList.vue'),
  reading: () => import('@/components/features/ReadingList/ReadingList.vue'),
  year: () => import('@/components/features/ThisYearList/ThisYearList.vue'),
  tbr: () => import('@/components/features/TBRList/TBRList.vue'),
};

// Fallback exibido enquanto o chunk de cada lista é baixado (evita slide em branco)
const BookList = defineAsyncComponent({
  loader: component_loaders.books,
  loadingComponent: LoadingSpinner,
  delay: 200,
});

const TBRList = defineAsyncComponent({
  loader: component_loaders.tbr,
  loadingComponent: LoadingSpinner,
  delay: 200,
});

const ReadingList = defineAsyncComponent({
  loader: component_loaders.reading,
  loadingComponent: LoadingSpinner,
  delay: 200,
});

const ThisYearList = defineAsyncComponent({
  loader: component_loaders.year,
  loadingComponent: LoadingSpinner,
  delay: 200,
});

// Pré-carrega chunks para tipos lógicos específicos (apenas em produção)
// import() direto dispara o download antecipado para que o chunk já esteja cacheado
// quando o componente assíncrono for renderizado
function prefetch_chunks_for_types(types) {
  if (import.meta.env.PROD) {
    types.forEach((type) => {
      const loader = component_loaders[type];
      if (loader) {
        loader().catch(() => {});
      }
    });
  }
}

// Busca dados necessários ao entrar em determinado tipo de slide
function fetch_data_for_type(type) {
  if (type === 'books') {
    // Carrega lista geral + leituras em andamento ao acessar o card de livros
    bookStore.fetch_books_by_status();
    bookStore.fetch_books_by_status(undefined, BOOK_STATUS_MAP.READING);
    // O slide "year" só existe após this_year_count > 0; buscar aqui evita o loop morto
    bookStore.fetch_books_read_this_year();
    return;
  }

  if (type === 'reading') {
    // Garante dados de leituras em andamento (caso ainda não carregados)
    bookStore.fetch_books_by_status(undefined, BOOK_STATUS_MAP.READING);
    // Garante que o slide "year" possa surgir mesmo sem passar pelo slide de livros
    bookStore.fetch_books_read_this_year();
    return;
  }

  if (type === 'year') {
    bookStore.fetch_books_read_this_year();
    return;
  }
}

// Ao inicializar o Swiper
function on_swiper_init(swiper) {
  swiper_instance.value = swiper;
}

// Slides entram/saem conforme os dados chegam; o Swiper precisa recalcular
watch(
  () => visible_slides.value.length,
  () => {
    nextTick(() => swiper_instance.value?.update());
  },
);

// Ao mudar de slide
function on_slide_change(swiper) {
  const active_type = get_active_logical_type(swiper.activeIndex);
  if (!active_type) return;

  // Busca dados conforme o tipo ativo
  fetch_data_for_type(active_type);

  // Pré-carrega chunks dos próximos slides visíveis
  const next_types = get_next_visible_types(active_type);
  prefetch_chunks_for_types(next_types);
}

// Pré-carrega chunks dos próximos slides visíveis a partir de um tipo
function prefetch_from_type(type) {
  prefetch_chunks_for_types(get_next_visible_types(type));
}

// Na montagem, pré-carrega slides e verifica se há slide alvo via query string
onMounted(() => {
  // Pré-carregamento leve dos próximos chunks (após primeiro paint)
  setTimeout(() => {
    const first_visible = visible_slides.value[0]?.type ?? null;
    if (first_visible) {
      prefetch_from_type(first_visible);
    } else {
      prefetch_chunks_for_types(['books', 'reading', 'year', 'tbr']);
    }
  }, 1500);

  const slide_target = route.query.slide;
  if (slide_target !== undefined && slide_target !== null) {
    const target_index = Number(slide_target);

    // Busca dados com base no índice alvo (lógico/original esperado)
    if (target_index >= 2) {
      bookStore.fetch_books_by_status();
      bookStore.fetch_books_by_status(undefined, BOOK_STATUS_MAP.READING);
    }
    if (target_index >= 3) {
      bookStore.fetch_books_read_this_year();
    }

    nextTick(() => {
      // Tenta navegar para o índice alvo (respeitando slides renderizados)
      const max_index = Math.max(0, visible_slides.value.length - 1);
      const clamped = Math.min(target_index, max_index);
      swiper_instance.value?.slideTo(clamped, 300);
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
    <SwiperSlide v-for="slide in visible_slides" :key="slide.id" class="stack-view__slide">
      <CardIntro v-if="slide.type === 'intro'" class="stack-view__card stack-view__intro" />

      <div v-else-if="slide.type === 'books'" class="stack-view__card stack-view__book-list">
        <BookList />
      </div>

      <div v-else-if="slide.type === 'reading'" class="stack-view__card stack-view__now">
        <ReadingList />
      </div>

      <div v-else-if="slide.type === 'year'" class="stack-view__card stack-view__year">
        <ThisYearList />
      </div>

      <div v-else-if="slide.type === 'tbr'" class="stack-view__card stack-view__tbr">
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
