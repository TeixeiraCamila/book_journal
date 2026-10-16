// Funções utilitárias para formatar dados de livros
import { BOOK_TYPE_LABELS } from '@/constants/book';

export function useBookFormatters() {
  const getAuthorString = (book) => {
    const literaryAtlas = book.literaryAtlas ? `${book.literaryAtlas} ` : '';
    const authors = Array.isArray(book.author) ? book.author.join(', ') : book.author || '';
    return `${literaryAtlas}${authors}`.trim();
  };

  // Percentual de páginas lidas; 0 quando faltam dados
  const getPagesProgress = (book) => {
    const current = book.pages?.currentlyPage;
    const total = book.pages?.totalPages;
    if (!current || !total) return 0;
    return Math.round((parseInt(current) / parseInt(total)) * 100);
  };

  const getPagesString = (book) => {
    const current = book.pages?.currentlyPage;
    const total = book.pages?.totalPages;
    if (!current || !total) return '';
    return `Páginas: ${current} / ${total} (${getPagesProgress(book)}%)`;
  };

  // Página atual derivada de um percentual (watch de progresso do Kindle)
  const getPageFromProgress = (totalPages, progress) => {
    if (!totalPages || !progress || Number(totalPages) <= 0 || Number(progress) <= 0) return null;
    return Math.round((Number(totalPages) * Number(progress)) / 100);
  };

  // Tipos sem tradução caem no valor cru (ex.: "Kindle")
  const getTypeString = (book) => {
    if (!book.type?.length) return '';
    return book.type.map((type) => BOOK_TYPE_LABELS[type] || type).join(', ');
  };

  const getPublicationString = (book) => {
    // publishedBy é select simples no Notion: string, não array
    const publisher = book.publishedBy;
    const year = book.firstPublished;

    if (publisher && year) {
      return `Publicado por ${publisher} em ${year}`;
    }

    if (publisher) {
      return `Publicado por ${publisher}`;
    }

    if (year) {
      return `Primeira publicação em ${year}`;
    }

    return 'Informação de publicação não disponível';
  };

  return {
    getAuthorString,
    getPagesProgress,
    getPagesString,
    getPageFromProgress,
    getTypeString,
    getPublicationString,
  };
}
