// Barrel de exportação de componentes de funcionalidades
export { default as CardStackView } from './Stack/CardStackView.vue';
export { default as CardIntro } from './Stack/CardIntro.vue';
export { default as TBRList } from './TBRList/TBRList.vue';
export { default as ReadingList } from './ReadingList/ReadingList.vue';

// Re-exporta todos os componentes dos subdiretórios
export * from './Stack';
export * from './TBRList';
export * from './ReadingList';
