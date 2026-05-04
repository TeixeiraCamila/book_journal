/**
 * Constantes relacionadas a livros
 * NOTA: Estas constantes são fallbacks - as opções principais vêm do backend via /options
 */

// Configuração de paginação
export const DEFAULT_PAGE_SIZE = 20

// Status dos livros (fallback)
export const BOOK_STATUS_FALLBACK = ['To be read', 'Reading', 'Read', 'DNF']

// Objeto para mapeamento interno
export const BOOK_STATUS_MAP = {
  TO_READ: 'To be read',
  READING: 'Reading',
  READ: 'Read',
  DNF: 'DNF',
}

// Mapeamento para exibição em português
export const BOOK_STATUS_LABELS = {
  'To be read': 'Para Ler',
  Reading: 'Lendo',
  Read: 'Completo',
  DNF: 'Abandonado',
}

// Labels de avaliação
export const BOOK_RATE_LABELS = {
  '❤': 'Favorito ❤',
  '⭐⭐⭐⭐⭐': '5 Estrelas ⭐⭐⭐⭐⭐',
  '⭐⭐⭐⭐': '4 Estrelas ⭐⭐⭐⭐',
  '⭐⭐⭐': '3 Estrelas ⭐⭐⭐',
  '⭐⭐': '2 Estrelas ⭐⭐',
  '⭐': '1 Estrela ⭐',
}

// Tipos de livro (fallback)
export const BOOK_TYPES_FALLBACK = ['🎧 Audiobook', '📱 Kindle', '📔 Mangá', '📘 Paper']

// Labels de tipo para exibição
export const BOOK_TYPE_LABELS = {
  '🎧 Audiobook': 'Audiobook 🎧',
  '📱 Kindle': 'Kindle 📱',
  '📔 Mangá': 'Mangá 📔',
  '📘 Paper': 'Papel 📘',
}