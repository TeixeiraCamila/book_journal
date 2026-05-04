<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <section class="form-section">
    <h3 v-if="title" class="form-section__title">{{ title }}</h3>
    <div class="form-section__content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-section__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--accent_muted);
}

.form-section__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
