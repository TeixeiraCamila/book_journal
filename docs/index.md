# Documentação — book_journal

book_journal é uma SPA Vue 3 + Pinia para gerenciamento de biblioteca pessoal, conectada ao Notion via API REST.

## Stack

- Vue 3 (Composition API, <script setup>)
- Pinia (stores)
- Vue Router (lazy loading, guards)
- vue-toastification (notificações)
- Axios (HTTP)
- GSAP (animações)
- lucide-vue-next (ícones)

## Arquivos desta pasta

| Arquivo | Assunto |
|---------|--------|
| composables.md | useBookFormatters, useNotifications, useAnimatedModal |
| utils.md | errorHandler.js, validation.js |
| constants.md | book.js, toast.js |
| services.md | api.js (Axios) |
| stores.md | bookStore, userStore |
| router.md | Rotas e guard |
| components.md | Estrutura de componentes |
