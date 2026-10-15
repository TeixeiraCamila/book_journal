// Funções utilitárias para formatar dados de livros
export function useBookFormatters() {
  const getAuthorString = (book) => {
    const literaryAtlas = book.literaryAtlas ? `${book.literaryAtlas} ` : '';
    const authors = Array.isArray(book.author) ? book.author.join(', ') : book.author || '';
    return `${literaryAtlas}${authors}`.trim();
  };

  const getPagesString = (book) => {
    const current = book.pages?.currentlyPage;
    const total = book.pages?.totalPages;
    if (!current || !total) return '';
    const progress = Math.round((parseInt(current) / parseInt(total)) * 100);
    return `Páginas: ${current} / ${total} (${progress}%)`;
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

  return { getAuthorString, getPagesString, getPublicationString };
}
