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
.btn {
  background: var(--button_color, #f0f0f0);
  color: var(--button_text, var(--black));
}

.btn__inner {
  display: flex;
  gap: 1em;
  align-items: center;
  justify-content: center;
}

/* ---- PRIMARY ---- */
.btn--primary {
  --button_color: var(--accent);
  --button_text: var(--black);
}

/* ---- SECONDARY ---- */
.btn--secondary {
  --button_color: transparent;
  --button_text: var(--black);
  border: 1px solid var(--black);
}

/* ---- DANGER ---- */
.btn--danger {
  --button_color: var(--danger);
  --button_text: var(--white);
}

.btn--danger:hover {
  background: #7f1d1d;
}

/* ---- DISABLED ---- */
.btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
