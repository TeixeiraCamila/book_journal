export function useBookFormatters() {
  const getAuthorString = (book) => {
    const literaryAtlas = book.literaryAtlas ? `${book.literaryAtlas} ` : '';
    return `${literaryAtlas}${book.author.join(', ')}`;
  };

  const getPagesString = (book) => {
    if (!book.totalPages || !book.currentlyOn) return '';
    const progress = Math.round((parseInt(book.currentlyOn) / parseInt(book.totalPages)) * 100);
    return `Páginas: ${book.currentlyOn} / ${book.totalPages} (${progress}%)`;
  };

  const getPublicationString = (book) => {
    const publisher = book.publishedBy?.[0];
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
