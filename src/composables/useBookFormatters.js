export function use_book_formatters() {
  const get_author_string = (book) => {
    const literary_atlas = book.literaryAtlas ? `${book.literaryAtlas} ` : '';
    const authors = Array.isArray(book.author) ? book.author.join(', ') : book.author || '';
    return `${literary_atlas}${authors}`.trim();
  };

  const get_pages_string = (book) => {
    const current = book.pages?.currentlyPage;
    const total = book.pages?.totalPages;
    if (!current || !total) return '';
    const progress = Math.round((parseInt(current) / parseInt(total)) * 100);
    return `Páginas: ${current} / ${total} (${progress}%)`;
  };

  const get_publication_string = (book) => {
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

  return { get_author_string, get_pages_string, get_publication_string };
}
