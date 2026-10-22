// Barrel raiz dos componentes — repassa só o que existe em src/components
// Sub-barrels: books, features, forms, ui
export * from './books';
export * from './features';
export * from './forms';
export * from './ui';

// Pastas sem index.js próprio
export { default as Filters } from './navigation/Filters.vue';
export { default as Pagination } from './navigation/Pagination.vue';
export { default as ConfirmDialog } from './feedback/ConfirmDialog.vue';
