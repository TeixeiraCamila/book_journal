<!-- Estado genérico de loading/erro/vazio — unifica os blocos das listas e views -->
<script setup>
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import Button from '@/components/ui/Button.vue';

defineProps({
  loading: Boolean,
  // Mensagem de erro (string) ou false para "sem erro"
  error: { type: [String, Boolean], default: false },
  empty: Boolean,
  loadingMessage: { type: String, default: 'Carregando...' },
  // Ícone do estado vazio; string vazia omite (ex.: ThisYearList)
  emptyIcon: { type: String, default: '📚' },
  emptyTitle: { type: String, default: 'Nenhum item encontrado' },
  emptyText: { type: String, default: '' },
  retryLabel: { type: String, default: 'Tentar Novamente' },
});

defineEmits(['retry']);
</script>

<template>
  <!-- Ordem única de estados: loading → erro → vazio → conteúdo -->
  <div v-if="loading" class="state-handler state-handler--loading" role="status" aria-live="polite">
    <slot name="loading">
      <LoadingSpinner
        ><p>{{ loadingMessage }}</p></LoadingSpinner
      >
    </slot>
  </div>

  <div v-else-if="error" class="state-handler state-handler--error" role="alert">
    <div class="state-handler__icon">⚠️</div>
    <p class="state-handler__message">{{ error }}</p>
    <Button @click="$emit('retry')">{{ retryLabel }}</Button>
  </div>

  <div v-else-if="empty" class="state-handler state-handler--empty">
    <div v-if="emptyIcon" class="state-handler__icon state-handler__icon--empty">
      {{ emptyIcon }}
    </div>
    <h2 class="state-handler__title">{{ emptyTitle }}</h2>
    <p v-if="emptyText" class="state-handler__text">{{ emptyText }}</p>
  </div>

  <slot v-else />
</template>

<style scoped>
.state-handler {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.state-handler--loading {
  padding: 2rem;
}

.state-handler--error {
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius);
  margin: 2rem;
}

.state-handler__icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.state-handler__icon--empty {
  font-size: 4rem;
}

.state-handler__message {
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  color: var(--danger);
}

.state-handler__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--black);
  margin-bottom: 0.5rem;
}

.state-handler__text {
  color: var(--muted);
  max-width: 400px;
  line-height: 1.6;
}
</style>
