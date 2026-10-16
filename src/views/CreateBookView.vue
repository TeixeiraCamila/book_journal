<script setup>
// View de criação/edição de livro — gerencia carregamento assíncrono e exibe formulário
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBookStore } from '@/stores/bookStore';
import { useNotifications } from '@/composables/useNotifications';
import BookForm from '@/components/forms/BookForm/BookForm.vue';
import FormSkeleton from '@/components/ui/Skeleton/FormSkeleton.vue';
import StateHandler from '@/components/ui/StateHandler.vue';

const { addNotification } = useNotifications();

const route = useRoute();
const router = useRouter();
const bookStore = useBookStore();

const book = ref(null);
const isLoading = ref(false);
const error = ref(null);
const isEdit = computed(() => !!route.params.id);

// Carrega dados do livro para edição — busca da store ou API se necessário
const loadBook = async () => {
  if (!isEdit.value) return;

  const bookId = route.params.id;
  isLoading.value = true;
  error.value = null;

  try {
    // Primeiro, garantir que temos os livros carregados
    if (bookStore.allBooks.length === 0) {
      await bookStore.fetchBooks();
    }

    // Buscar livro pelo ID
    book.value = bookStore.getBookById(bookId);

    if (!book.value) {
      // Tentar buscar o livro diretamente da API
      try {
        book.value = await bookStore.fetchBookById(bookId);
      } catch {
        throw new Error('Livro não encontrado');
      }
    }
  } catch (err) {
    error.value = err.message || 'Erro ao carregar livro';
    addNotification(error.value, 'error');
  } finally {
    isLoading.value = false;
  }
};

// Carregar livro quando o componente for montado ou quando o ID da rota mudar
onMounted(loadBook);
watch(() => route.params.id, loadBook);

// Volta para a home (após criar, editar ou cancelar)
const goHome = () => {
  router.push({ path: '/', query: { slide: '1' } });
};
</script>

<template>
  <div class="create-book-view">
    <header class="create-book-view__header">
      <div class="create-book-view__header-content">
        <router-link :to="{ path: '/', query: { slide: '1' } }" class="create-book-view__link">
          <span class="create-book-view__back-icon">←</span>
          <span>Voltar para lista</span>
        </router-link>
        <h1 v-if="isEdit" class="create-book-view__title">Editar Livro</h1>
        <h1 v-else class="create-book-view__title">Novo Livro</h1>
      </div>
    </header>

    <main class="create-book-view__content">
      <StateHandler
        :loading="isLoading"
        :error="error ? error : false"
        empty-icon=""
        @retry="loadBook"
      >
        <template #loading>
          <FormSkeleton />
        </template>

        <BookForm :book="book" :is-edit="isEdit" @cancel="goHome" @edit-success="goHome" />
      </StateHandler>
    </main>
  </div>
</template>

<style scoped>
.create-book-view {
  width: 80vw;
  height: 80vh;
  background: var(--bg);
  overflow: auto;
  border-radius: var(--radius-lg);
  margin: 0 auto;
}

.create-book-view__header {
  padding: 1rem 1.5rem;
  box-shadow: var(--box-shadow);
  border-radius: var(--radius-lg);
}

.create-book-view__header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.create-book-view__link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.create-book-view__back-icon {
  font-size: 1.25rem;
}

.create-book-view__link:hover {
  color: var(--accent3_muted);
}

.create-book-view__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--black);
  margin: 0;
}
</style>
