// Barrel exports para componentes principais
// Importações frequentes e padronizadas

// UI Components
export { default as Button } from './ui/Button.vue'
export { default as LoadingSpinner } from './ui/LoadingSpinner.vue'
export { default as Input } from './ui/Input.vue'
export { default as Modal } from './ui/Modal.vue'
export { default as Card } from './ui/Card.vue'
export { default as Badge } from './ui/Badge.vue'

// Form Components
export { default as FormField } from './forms/FormField.vue'
export { default as FormSection } from './forms/FormSection.vue'
export { default as FormActions } from './forms/FormActions.vue'
export { default as BookForm } from './forms/BookForm/BookForm.vue'

// Book Components
export { default as BookCard } from './books/BookCard/BookCard.vue'
export { default as BookList } from './books/BookList/BookList.vue'
export { default as BookDetails } from './books/BookDetails/BookDetails.vue'
export { default as ReadingProgress } from './books/ReadingProgress/ReadingProgress.vue'

// Layout Components
export { default as Header } from './layout/Header.vue'
export { default as Layout } from './layout/Layout.vue'
export { default as Container } from './layout/Container.vue'

// Navigation Components
export { default as Pagination } from './navigation/Pagination.vue'
export { default as Filters } from './navigation/Filters.vue'
export { default as SearchBar } from './navigation/SearchBar.vue'

// Feedback Components
export { default as Notification } from './feedback/Notification.vue'
export { default as ToastContainer } from './feedback/ToastContainer.vue'
export { default as ConfirmDialog } from './feedback/ConfirmDialog.vue'

// Feature Components
export { default as CardStackView } from './features/Stack/CardStackView.vue'
export { default as CardIntro } from './features/Stack/CardIntro.vue'
export { default as TBRList } from './features/TBRList/TBRList.vue'
export { default as ReadingList } from './features/ReadingList/ReadingList.vue'

// Skeleton Components
export { default as BookCardSkeleton } from './ui/Skeleton/BookCardSkeleton.vue'
export { default as FormSkeleton } from './ui/Skeleton/FormSkeleton.vue'

// Re-export all from subdirectories for flexibility
export * from './ui'
export * from './forms'
export * from './books'
export * from './layout'
export * from './navigation'
export * from './feedback'
export * from './features'
