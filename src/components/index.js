// Barrel de exportação para componentes principais
// Importações frequentes e padronizadas

// Componentes de interface
export { default as Button } from './ui/Button.vue';
export { default as LoadingSpinner } from './ui/LoadingSpinner.vue';
export { default as Input } from './ui/Input.vue';
export { default as Modal } from './ui/Modal.vue';
export { default as Card } from './ui/Card.vue';
export { default as Badge } from './ui/Badge.vue';

// Componentes de formulários
export { default as FormField } from './forms/FormField.vue';
export { default as FormSection } from './forms/FormSection.vue';
export { default as FormActions } from './forms/FormActions.vue';
export { default as BookForm } from './forms/BookForm/BookForm.vue';

// Componentes de livros
export { default as BookCard } from './books/BookCard/BookCard.vue';
export { default as BookList } from './books/BookList/BookList.vue';
export { default as BookDetails } from './books/BookDetails/BookDetails.vue';
export { default as ReadingProgress } from './books/ReadingProgress/ReadingProgress.vue';

// Componentes de layout
export { default as Header } from './layout/Header.vue';
export { default as Layout } from './layout/Layout.vue';
export { default as Container } from './layout/Container.vue';

// Componentes de navegação
export { default as Pagination } from './navigation/Pagination.vue';
export { default as Filters } from './navigation/Filters.vue';
export { default as SearchBar } from './navigation/SearchBar.vue';

// Componentes de feedback
export { default as ConfirmDialog } from './feedback/ConfirmDialog.vue';

// Componentes de funcionalidades
export { default as CardStackView } from './features/Stack/CardStackView.vue';
export { default as CardIntro } from './features/Stack/CardIntro.vue';
export { default as TBRList } from './features/TBRList/TBRList.vue';
export { default as ReadingList } from './features/ReadingList/ReadingList.vue';

// Componentes de esqueleto
export { default as BookCardSkeleton } from './ui/Skeleton/BookCardSkeleton.vue';
export { default as FormSkeleton } from './ui/Skeleton/FormSkeleton.vue';

// Re-exporta todos os componentes dos subdiretórios
export * from './ui';
export * from './forms';
export * from './books';
export * from './layout';
export * from './navigation';
export * from './feedback';
export * from './features';
