
<script setup>
// Botão reutilizável com variantes (primary/secondary) e suporte a slot para conteúdo
defineProps({
  variant: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false }
})
defineEmits(['click']);
</script>

<template>
  <button
    :class="['btn', `btn--${variant}`, { 'btn--disabled': disabled }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

