<script setup>
// Capa do livro com fallback local (📖 em SVG) — unifica placehold.co e os 📖 das listas
import { computed } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  // Legenda opcional desenhada no placeholder (ex.: "Sem capa")
  label: { type: String, default: '' },
});

// Placeholder em SVG data-URI: mantém o <img> em todos os usos e elimina a dependência de rede
const placeholderSrc = computed(() => {
  const caption = props.label
    ? `<text x="113" y="240" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#9ca3af">${props.label}</text>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="226" height="354" viewBox="0 0 226 354"><rect width="226" height="354" fill="#f3f4f6"/><text x="113" y="185" text-anchor="middle" font-size="72">📖</text>${caption}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
});
</script>

<template>
  <img
    class="book-cover"
    :src="src || placeholderSrc"
    :alt="src ? alt : 'Sem capa disponível'"
    loading="lazy"
    decoding="async"
  />
</template>
