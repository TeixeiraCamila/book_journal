<script setup>
// View de criação/edição de livro — gerencia carregamento assíncrono e exibe formulário
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { use_book_store } from '@/stores/bookStore';
import { use_notifications } from '@/composables/useNotifications';
import BookForm from '@/components/forms/BookForm/BookForm.vue';
import FormSkeleton from '@/components/ui/Skeleton/FormSkeleton.vue';
import Button from '@/components/ui/Button.vue';

const { add_notification } = use_notifications();

const route = useRoute();
const router = useRouter();
const bookStore = use_book_store();

const book = ref(null);
const is_loading = ref(false);
const error = ref(null);
const is_edit = computed(() => !!route.params.id);

// Carrega dados do livro para edição — busca da store ou API se necessário
const load_book = async () => {
  if (!is_edit.value) return;

  const book_id = route.params.id;
  is_loading.value = true;
  error.value = null;

  try {
    // Primeiro, garantir que temos os livros carregados
    if (bookStore.all_books.length === 0) {
      await bookStore.fetch_books();
    }

    // Buscar livro pelo ID
    book.value = bookStore.get_book_by_id(book_id);

    if (!book.value) {
      // Tentar buscar o livro diretamente da API
      try {
        book.value = await bookStore.fetch_book_by_id(book_id);
      } catch {
        throw new Error('Livro não encontrado');
      }
    }
  } catch (err) {
    error.value = err.message || 'Erro ao carregar livro';
    add_notification(error.value, 'error');
  } finally {
    is_loading.value = false;
  }
};

// Carregar livro quando o componente for montado ou quando o ID da rota mudar
onMounted(load_book);
watch(() => route.params.id, load_book);

const handle_submit = () => {
  // Notificação já é exibida no BookForm após sucesso da operação
};

const handle_edit_success = () => {
  router.push({ path: '/', query: { slide: '1' } });
};

const handle_cancel = () => {
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
        <h1 v-if="is_edit" class="create-book-view__title">Editar Livro</h1>
        <h1 v-else class="create-book-view__title">Novo Livro</h1>
      </div>
    </header>

    <main class="create-book-view__content">
      <FormSkeleton v-if="is_loading" />
      <div v-else-if="error" class="create-book-view__error">
        <h3>Erro ao carregar livro</h3>
        <p>{{ error }}</p>
        <Button @click="load_book">Tentar novamente</Button>
      </div>
      <BookForm
        v-else
        :book="book"
        :is-edit="is_edit"
        @submit="handle_submit"
        @cancel="handle_cancel"
        @edit-success="handle_edit_success"
      />
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

.create-book-view__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: rgba(239, 68, 68, 0.05);
  border-radius: var(--radius);
  margin: 2rem;
}

.create-book-view__error h3 {
  color: var(--danger);
  margin-bottom: 1rem;
}

.create-book-view__error p {
  color: var(--danger);
  margin-bottom: 1.5rem;
}
</style>
