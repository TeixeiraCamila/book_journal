// Tipos de estado das stores Pinia (consumidos na Fase 3 da migração)

import type { Book } from './book';

// Listas do bookStore: cada status relevante tem sua própria fatia
export interface BookLists {
  main: Book[];
  tbr: Book[];
  reading: Book[];
  thisYear: Book[];
}

export type ListKey = keyof BookLists;

// Flags de carregamento espelham as chaves das listas
export type LoadingStates = Record<ListKey, boolean>;
