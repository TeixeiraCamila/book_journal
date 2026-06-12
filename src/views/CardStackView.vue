<script setup>
// View principal — stack de cards vertical com Swiper (intro, book list, reading, TBR)
import { defineAsyncComponent, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useBookStore } from '@/stores/bookStore'
import { BOOK_STATUS_MAP } from '@/constants/book'
import CardIntro from '@/components/features/Stack/CardIntro.vue'
import Button from '@/components/ui/Button.vue'

const bookStore = useBookStore()
const userStore = useUserStore()

// Componentes carregados sob demanda para otimizar performance inicial
const BookList = defineAsyncComponent(() => import('@/components/books/BookList/BookList.vue'))
const TBRList = defineAsyncComponent(() => import('@/components/features/TBRList/TBRList.vue'))
const ReadingList = defineAsyncComponent(() =>
  import('@/components/features/ReadingList/ReadingList.vue')
)
// Swiper.js — biblioteca de slides com efeito de cards empilhados (vertical)
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCards } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'

const router = useRouter()
const route = useRoute()
const swiperInstance = ref(null)
const modules = [EffectCards]

function onSwiperInit(swiper) {
  swiperInstance.value = swiper
}

const navigateToCreate = () => {
  router.push('/criar')
}

// Ao mudar de slide, pré-carrega dados dos próximos cards (leitura adiada)
const onSlideChange = (swiper) => {
  const activeIndex = swiper.activeIndex

  if (activeIndex === 1) {
    bookStore.fetchBooksByStatus()
    bookStore.fetchBooksByStatus(undefined, BOOK_STATUS_MAP.READING)
    prefetchNextSlides([2, 3])
  }
  if (activeIndex === 2) {
    prefetchNextSlides([3])
  }
}

// Pré-carrega chunks de componentes em produção para navegação instantânea
function prefetchNextSlides(slideIndices) {
  if (import.meta.env.PROD) {
    slideIndices.forEach((index) => {
      triggerChunkPrefetch(index)
    })
  }
}

function triggerChunkPrefetch(slideIndex) {
  const chunks = {
    1: () => import('@/components/books/BookList/BookList.vue'),
    2: () => import('@/components/features/ReadingList/ReadingList.vue'),
    3: () => import('@/components/features/TBRList/TBRList.vue'),
  }

  const loader = chunks[slideIndex]
  if (loader) {
    loader().catch(() => {})
  }
}

// Na montagem, pré-carrega slides e verifica se há slide alvo via query string
onMounted(() => {
  setTimeout(() => {
    prefetchNextSlides([1, 2, 3])
  }, 1500)

  const slideTarget = route.query.slide
  if (slideTarget) {
    const target = Number(slideTarget)
    if (target >= 2) {
      bookStore.fetchBooksByStatus()
      bookStore.fetchBooksByStatus(undefined, BOOK_STATUS_MAP.READING)
    }
    nextTick(() => {
      swiperInstance.value?.slideTo(target, 300)
    })
  }
})
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

        <Button
          v-if="!userStore.isGuest"
          class="fab"
          aria-label="Adicionar novo livro"
          @click="navigateToCreate"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12 4V20M4 12H20"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Button>
      </div>
    </SwiperSlide>

    <SwiperSlide class="stack-view__slide" v-if="bookStore.bookLists.reading.length">
      <div class="stack-view__card stack-view__now">
        <ReadingList />
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
}

/* Card da lista de livros com background */
.stack-view__book-list {
  background-image: url('../assets/images/bg-default.webp');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stack-view__tbr {
  background: url('https://i.pinimg.com/736x/70/c1/9f/70c19f807b5934f93167a814fb1d98ab.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  content-visibility: auto;
}

.stack-view__now {
  background-image: url('../assets/images/cards/card_reading/bg.webp');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

/* ===== FLOATING ACTION BUTTON ===== */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: var(--accent3);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.fab:active {
  transform: scale(0.95);
}

.fab svg {
  transition: transform 0.2s ease;
}

.fab:hover svg {
  transform: rotate(90deg);
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

  .fab {
    bottom: 1rem;
    right: 1rem;
    width: 48px;
    height: 48px;
  }
}
</style>
