<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookStore } from '@/stores/bookStore'
import { useNotifications } from '@/composables/useNotifications'
import BookForm from '@/components/forms/BookForm/BookForm.vue'
import FormSkeleton from '@/components/ui/Skeleton/FormSkeleton.vue'
import Button from '@/components/ui/Button.vue'

// Página de criar/editar livro — gerencia carregamento e transições
const { addNotification } = useNotifications()

const route = useRoute()
const router = useRouter()
const bookStore = useBookStore()

const book = ref(null)
const isLoading = ref(false)
const error = ref(null)
const isEdit = computed(() => !!route.params.id)

const loadBook = async () => {
  if (!isEdit.value) return

  const bookId = route.params.id
  isLoading.value = true
  error.value = null

  try {
    // Primeiro, garantir que temos os livros carregados
    if (bookStore.allBooks.length === 0) {
      await bookStore.fetchBooks()
    }

    // Buscar livro pelo ID
    book.value = bookStore.getBookById(bookId)

    if (!book.value) {
      // Tentar buscar o livro diretamente da API
      try {
        book.value = await bookStore.fetchBookById(bookId)
      } catch (apiError) {
        throw new Error('Livro não encontrado')
      }
    }
  } catch (err) {
    error.value = err.message || 'Erro ao carregar livro'
    addNotification(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}

// Carregar livro quando o componente for montado ou quando o ID da rota mudar
onMounted(loadBook)
watch(() => route.params.id, loadBook)

const handleSubmit = () => {
  // Notificação já é exibida no BookForm após sucesso da operação
}

const handleEditSuccess = (bookId) => {
  router.push('/')
}

const handleCancel = () => {
  router.push('/')
}
</script>

<template>
  <div class="create-book-view">
    <header class="create-book-view__header">
      <div class="create-book-view__header-content">
        <router-link to="/" class="create-book-view__link">
          <span class="create-book-view__back-icon">←</span>
          <span>Voltar para lista</span>
        </router-link>
        <h1 v-if="isEdit" class="create-book-view__title">Editar Livro</h1>
        <h1 v-else class="create-book-view__title">Novo Livro</h1>
      </div>
    </header>

    <main class="create-book-view__content">
      <FormSkeleton v-if="isLoading" />
      <div v-else-if="error" class="create-book-view__error">
        <h3>Erro ao carregar livro</h3>
        <p>{{ error }}</p>
        <Button @click="loadBook" class="create-book-view__retry-btn">Tentar novamente</Button>
      </div>
      <BookForm v-else :book="book" :is-edit="isEdit" @submit="handleSubmit" @cancel="handleCancel" @edit-success="handleEditSuccess" />
    </main>
  </div>
</template>

<style scoped>
.create-book-view {
  width: 80vw;
  height: 80vh;
  background: linear-gradient(to bottom right, #eef2ff, white, #faf5ff);
  overflow: scroll;
  border-radius: 12px;
}

.create-book-view__header {
  padding: 1rem 1.5rem;
  box-shadow: var(--box-shadow);
  border-radius: 12px;
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
  color: #6b7280;
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
  color: #111827;
  margin: 0;
}

.create-book-view__content {
}

.create-book-view__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: rgba(239, 68, 68, 0.05);
  border-radius: 12px;
  margin: 2rem;
}

.create-book-view__error h3 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.create-book-view__error p {
  color: #7f1d1d;
  margin-bottom: 1.5rem;
}

.create-book-view__retry-btn {
  padding: 0.75rem 2rem;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-book-view__retry-btn:hover {
  background: var(--accent2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(218, 147, 143, 0.3);
}
</style>
