interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
    categories?: string[];
  };
}

interface GoogleBooksResponse {
  items: GoogleBookVolume[];
  totalItems: number;
}

export interface BookData {
  title: string;
  author: string;
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  thumbnail?: string;
  googleBooksId: string;
  isbn10?: string;
  isbn13?: string;
  categories: string[];
}

export async function searchGoogleBooks(query: string): Promise<BookData[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=10`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item) => {
      const volume = item.volumeInfo;

      // Find ISBN identifiers
      const isbn10 = volume.industryIdentifiers?.find(
        (id) => id.type === "ISBN_10"
      )?.identifier;
      const isbn13 = volume.industryIdentifiers?.find(
        (id) => id.type === "ISBN_13"
      )?.identifier;

      return {
        title: volume.title || "Unknown Title",
        author: volume.authors?.[0] || "Unknown Author",
        description: volume.description,
        publishedDate: volume.publishedDate,
        pageCount: volume.pageCount,
        thumbnail:
          volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail,
        googleBooksId: item.id,
        isbn10,
        isbn13,
        categories: volume.categories || [],
      };
    });
  } catch (error) {
    console.error("Error fetching from Google Books API:", error);
    throw new Error("Failed to search Google Books");
  }
}

export async function getBookByQuery(
  author: string,
  title: string
): Promise<BookData | null> {
  const query = `${author} ${title}`;
  const results = await searchGoogleBooks(query);

  // Find the best match - exact title and author match
  const exactMatch = results.find(
    (book) =>
      book.title.toLowerCase().includes(title.toLowerCase()) &&
      book.author.toLowerCase().includes(author.toLowerCase())
  );

  return exactMatch || results[0] || null;
}
