// Barrel de exportação de componentes de livros
export { default as BookCard } from './BookCard/BookCard.vue';
export { default as BookList } from './BookList/BookList.vue';
export { default as BookDetails } from './BookDetails/BookDetails.vue';
export { default as ReadingProgress } from './ReadingProgress/ReadingProgress.vue';

// Re-exporta todos os componentes dos subdiretórios
export * from './BookCard';
export * from './BookList';
export * from './BookDetails';
export * from './ReadingProgress';
