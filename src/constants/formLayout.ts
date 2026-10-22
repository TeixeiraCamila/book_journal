// Layout do formulário de livros — fonte única de seções/campos consumida por BookForm e FormSkeleton
// kinds: input | number | select | multi-select | date | checkbox (espelham os tipos do FormField)

export type FormFieldKind = 'input' | 'number' | 'select' | 'multi-select' | 'date' | 'checkbox';

export interface BookFormField {
  label: string;
  kind: FormFieldKind;
}

export interface BookFormSection {
  title: string;
  fields: BookFormField[];
}

export const BOOK_FORM_SECTIONS = {
  basicInfo: {
    title: 'Informações Básicas',
    fields: [
      { label: 'Título', kind: 'input' },
      { label: 'Autor', kind: 'input' },
      { label: 'Série do livro', kind: 'input' },
      { label: 'Volume', kind: 'number' },
    ],
  },
  statusProgress: {
    title: 'Status e Progresso',
    fields: [
      { label: 'Status', kind: 'select' },
      { label: 'Tipo', kind: 'select' },
      { label: 'Total de páginas', kind: 'number' },
      { label: 'Progresso Kindle (%)', kind: 'number' },
      { label: 'Página atual', kind: 'number' },
    ],
  },
  classification: {
    title: 'Avaliação e Classificação',
    fields: [
      { label: 'Avaliação', kind: 'select' },
      { label: 'Gêneros/Tags', kind: 'multi-select' },
    ],
  },
  publication: {
    title: 'Detalhes da Publicação',
    fields: [
      { label: 'Ano de publicação', kind: 'input' },
      { label: 'Publicado por', kind: 'input' },
      { label: 'Possuo cópia física', kind: 'checkbox' },
    ],
  },
  readingMeta: {
    title: 'Leitura e Metadados',
    fields: [
      { label: 'Lido em', kind: 'input' },
      { label: 'Data de início', kind: 'date' },
      { label: 'Data de término', kind: 'date' },
      { label: 'Atlas literário', kind: 'input' },
    ],
  },
} satisfies Record<string, BookFormSection>;

// Campo da coluna de capa (coluna esquerda do form)
export const BOOK_FORM_COVER_FIELD = { label: 'URL da Capa', kind: 'input' } satisfies BookFormField;

// Textos dos botões de ação
export const BOOK_FORM_ACTIONS: Record<'submit' | 'cancel', string> = {
  submit: 'Salvar Livro',
  cancel: 'Cancelar',
};
