// Contrato de livro espelhado de docs/API.md + docs/DATABASE.md (fonte: notion_api; nunca importado — repos independentes)

// Status dos livros conforme o vocabulário do app (fallback em constants/book)
export type BookStatus = 'To be read' | 'Reading' | 'Read' | 'DNF';

// Modos de busca textual aceitos pelo backend (query searchBy)
export type BookSearchMode = 'title' | 'author' | 'genre';

// Tipos de livro do fallback local; a leitura da API é aberta (string[])
export type BookType = 'Audiobook' | 'Kindle' | 'Mangá' | 'Paper';

// Contrato de LEITURA (GET): o backend apaga campos vazios (null, undefined ou []),
// exceto id, pages e seriesInfo (objetos sempre presentes, com internos nullable)
export interface Book {
  id: string;
  title: string;
  author: string[];
  pages: { totalPages: number | null; currentlyPage: number | null };
  seriesInfo: { bookSeries: string | null; volume: number | null };
  iHaveCopy: boolean;
  status?: BookStatus | string | null;
  wasReadIn?: string[];
  // Leitura devolve o objeto Date do Notion (escrita aceita string — assimetria do DATABASE.md §3)
  startEnd?: { start: string; end?: string | null } | null;
  cover?: string[];
  type?: string[];
  rate?: string | null;
  firstPublished?: string | null;
  genres?: string[];
  publishedBy?: string | null;
  literaryAtlas?: string | null;
  progress?: string | null;
}

// /books/options devolve as chaves dinâmicas de select/multi_select/status do Notion
export type BookOptions = Record<string, string[] | undefined>;

// Chaves conhecidas do options consumidas pelo app (o Notion pode devolver outras)
export type BookOptionKey =
  | 'Status'
  | 'Rate'
  | 'Type'
  | 'Author'
  | 'Genres'
  | 'Tags'
  | 'Book Series Name'
  | 'First published in'
  | 'Published by'
  | 'Was read in'
  | 'Atlas';

// Escrita (POST) — espelha o create_book_schema do backend (Zod)
export interface CreateBookInput {
  title: string;
  author: string[];
  status?: string | null;
  pages?: { totalPages?: number; currentlyPage?: number };
  wasReadIn?: string[];
  startEnd?: string;
  // Escrita usa coverUrl (string); leitura devolve cover (array)
  coverUrl?: string;
  type?: string | string[];
  rate?: string | null;
  iHaveCopy?: boolean;
  firstPublished?: string;
  genres?: string[];
  publishedBy?: string;
  literaryAtlas?: string;
  seriesInfo?: { bookSeries?: string | null; volume?: number | null };
}

// Escrita (PATCH) — todos os campos opcionais; null limpa o valor em status, rate, pages.* e seriesInfo.*
export type UpdateBookInput = Partial<Omit<CreateBookInput, 'pages' | 'seriesInfo'>> & {
  pages?: { totalPages?: number | null; currentlyPage?: number | null };
  startEnd?: string | { start?: string; end?: string } | null;
  seriesInfo?: { bookSeries?: string | null; volume?: number | null };
};
