import Link from "next/link";
import { prisma } from "../lib/prisma";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    include: {
      author: true,
      _count: {
        select: {
          reviews: true,
          myNotes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                ← Back to Home
              </Link>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Book Collection
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {books.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No books yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The book collection is empty. An admin needs to add books first.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/login"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Admin Login
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                All Books ({books.length})
              </h2>
              <p className="mt-2 text-gray-600">
                Browse our complete collection of curated books
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-2 aspect-h-3">
                    {book.thumbnail ? (
                      <img
                        className="w-full h-64 object-cover"
                        src={book.thumbnail}
                        alt={book.title}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                        <svg
                          className="h-16 w-16 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2 mb-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      by {book.author.name}
                    </p>

                    {book.categories.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {book.categories
                            .slice(0, 2)
                            .map((category, index) => (
                              <span
                                key={index}
                                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800"
                              >
                                {category}
                              </span>
                            ))}
                          {book.categories.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              +{book.categories.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {book.description && (
                      <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        {book._count.reviews > 0 && (
                          <span>
                            {book._count.reviews} review
                            {book._count.reviews !== 1 ? "s" : ""}
                          </span>
                        )}
                        {book._count.myNotes > 0 && (
                          <span>
                            {book._count.myNotes} note
                            {book._count.myNotes !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/books/${book.id}`}
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
