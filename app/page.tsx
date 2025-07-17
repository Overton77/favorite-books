import Link from "next/link";
import { prisma } from "./lib/prisma";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function Home() {
  // Get a few books to showcase
  const books = await prisma.book.findMany({
    take: 6,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Favorite Books
              </h1>
              <p className="text-gray-600">
                A curated collection of exceptional reads
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/books"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Browse Books
              </Link>
              <Link
                href="/admin/login"
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Discover Your Next
            <span className="text-indigo-600"> Great Read</span>
          </h2>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            These Are Books that I Absolutely Love. I created this site to be an
            archive and place where I can keep track of the books I've read.
          </h3>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Explore a carefully curated collection of books across various
            genres. Find detailed reviews, personal notes, and recommendations
            to guide your reading journey.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/books"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Browse All Books
            </Link>
          </div>
        </div>

        {/* Featured Books */}
        {books.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Recently Added Books
            </h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-w-3 aspect-h-4 relative">
                    {book.thumbnail ? (
                      <img
                        className="w-full h-80 object-cover"
                        src={book.thumbnail}
                        alt={book.title}
                      />
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg
                          className="h-20 w-20 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white line-clamp-2 mb-1">
                        {book.title}
                      </h3>
                      <p className="text-white/90 text-sm font-medium">
                        by {book.author.name}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Categories */}
                    {book.categories && book.categories.length > 0 && (
                      <div className="mb-4">
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
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                              +{book.categories.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {book.description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        {book._count.reviews > 0 && (
                          <span className="flex items-center">
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.13 8.13 0 01-2.939-.542l-3.286 1.542c-.742.35-1.584-.142-1.584-.989v-2.61A8.023 8.023 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                              />
                            </svg>
                            {book._count.reviews}
                          </span>
                        )}
                        {book._count.myNotes > 0 && (
                          <span className="flex items-center">
                            <svg
                              className="h-3 w-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            {book._count.myNotes}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/books/${book.id}`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        View Book
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {books.length === 6 && (
              <div className="text-center mt-8">
                <Link
                  href="/books"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                >
                  View All Books
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-white rounded-lg shadow-lg">
          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">
                Start Your Reading Journey
              </h3>
              <p className="mt-4 text-lg text-gray-600">
                Browse our collection of carefully selected books, read reviews,
                and discover your next favorite read.
              </p>
              <div className="mt-6">
                <Link
                  href="/books"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Explore Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 Favorite Books. Built with Next.js and Prisma.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
