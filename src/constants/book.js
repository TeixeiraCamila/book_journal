/**
 * Constantes relacionadas a livros — fallbacks para quando o backend não retorna opções
 * As opções principais são carregadas dinamicamente via /api/books/options
 */

// Configuração de paginação
export const DEFAULT_PAGE_SIZE = 20;

// Status dos livros (fallback)
export const BOOK_STATUS_FALLBACK = ['To be read', 'Reading', 'Read', 'DNF'];

// Objeto para mapeamento interno
export const BOOK_STATUS_MAP = {
  TO_BE_READ: 'To be read',
  READING: 'Reading',
  READ: 'Read',
  DNF: 'DNF',
};

// Mapeamento para exibição em português
export const BOOK_STATUS_LABELS = {
  'To be read': 'Para Ler',
  Reading: 'Lendo',
  Read: 'Completo',
  DNF: 'Abandonado',
};

// Modos de busca — o value vai na query searchBy do backend
export const BOOK_SEARCH_MODES = [
  { value: 'title', label: 'Título' },
  { value: 'author', label: 'Autor' },
  { value: 'genre', label: 'Gênero' },
];

export const DEFAULT_SEARCH_MODE = 'title';

// Placeholder do input conforme o modo escolhido
export const BOOK_SEARCH_PLACEHOLDERS = {
  title: 'Buscar por título...',
  author: 'Buscar por autor...',
  genre: 'Buscar por gênero...',
};

// Intervalo do debounce da busca em ms
export const SEARCH_DEBOUNCE_MS = 400;

// Labels de avaliação
export const BOOK_RATE_LABELS = {
  '❤': '❤️',
  '⭐⭐⭐⭐⭐': '*****',
  '⭐⭐⭐⭐': '****',
  '⭐⭐⭐': '***',
  '⭐⭐': '**',
  '⭐': '*',
};

// Tipos de livro (fallback) — espelha os valores do banco, sem ícones
export const BOOK_TYPES_FALLBACK = ['Audiobook', 'Kindle', 'Mangá', 'Paper'];

// Tradução pt-BR dos tipos; tipos sem entrada caem no valor cru via `|| t` no CardBack
export const BOOK_TYPE_LABELS = {
  Paper: 'Papel',
};
