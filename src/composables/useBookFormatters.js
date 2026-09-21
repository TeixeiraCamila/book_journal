export function use_book_formatters() {
  const get_author_string = (book) => {
    const literary_atlas = book.literaryAtlas ? `${book.literaryAtlas} ` : '';
    return `${literary_atlas}${book.author.join(', ')}`;
  };

  const get_pages_string = (book) => {
    if (!book.totalPages || !book.currentlyOn) return '';
    const progress = Math.round((parseInt(book.currentlyOn) / parseInt(book.totalPages)) * 100);
    return `Páginas: ${book.currentlyOn} / ${book.totalPages} (${progress}%)`;
  };

  const get_publication_string = (book) => {
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

  return { get_author_string, get_pages_string, get_publication_string };
}
