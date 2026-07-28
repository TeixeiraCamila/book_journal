<script setup>
defineProps({
  loading: Boolean,
  error: { type: [String, Boolean], default: false },
  empty: Boolean,
  loadingMessage: { type: String, default: 'Carregando...' },
  emptyTitle: { type: String, default: 'Nenhum item encontrado' },
  emptyText: { type: String, default: '' },
  onRetry: { type: Function, default: null },
})
</script>

<template>
  <div v-if="loading" class="state-handler__loading">...</div>
  <div v-else-if="error" class="state-handler__error">...</div>
  <div v-else-if="empty" class="state-handler__empty">...</div>
  <slot v-else />
</template>