<!-- eslint-disable vue/multi-word-component-names -->

<script setup>
// Botão reutilizável com variantes (primary/secondary/danger) e suporte a slot
defineProps({
  variant: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
});
defineEmits(['click']);
</script>

<template>
  <button
    :class="['btn', `btn--${variant}`, { 'btn--disabled': disabled }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span class="btn__inner">
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>
.btn__inner {
  display: flex;
  gap: 1em;
  align-items: center;
  justify-content: center;
}

/* ---- PRIMARY ---- */
.btn--primary {
  --button_color: var(--accent);
  --button_outline_color: var(--accent);
}

/* ---- SECONDARY ---- */
.btn--secondary .btn__inner {
  color: var(--black);
  border-color: var(--black);
}

/* ---- DANGER ---- */
.btn--danger {
  --button_color: #dc2626;
  --button_outline_color: #b91c1c;
}

.btn--danger:hover  {
  background: #b91c1c;
  /* box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); */
}

/* ---- DISABLED ---- */
.btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
