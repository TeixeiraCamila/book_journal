// Estados das stores Pinia — fonte única do shape do state para as duas stores
// (bookStore/userStore); existe para que state, getters e $reset assinem o mesmo
// contrato sem espelhar campos à mão em cada store.

import type { Book, BookOptions, BookSearchMode } from './book';
import type { GuestUser, SessionUser } from './auth';

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

// Paginação por cursor do bookStore (pilha de cursores anteriores para voltar)
export interface BookPagination {
  pageSize: number;
  currentCursor: string | null;
  nextCursor: string | null;
  previousCursors: string[];
}

// State completo do bookStore (espelha createInitialState de src/stores/bookStore)
export interface BookState {
  bookLists: BookLists;
  loadingStates: LoadingStates;
  error: string | null;
  pagination: BookPagination;
  searchTerm: string;
  searchBy: BookSearchMode;
  filterStatus: string;
  searchToken: number;
  bookOptions: BookOptions | null;
}

// State completo do userStore; a união em userActive expõe o visitante
// (`type: 'guest'`), que difere do SessionUser devolvido pelo backend
export interface UserState {
  userActive: SessionUser | GuestUser | null;
  error: string | null;
  isGuest: boolean;
  token: string | null;
}
