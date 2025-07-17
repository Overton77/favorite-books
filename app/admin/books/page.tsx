import { requireAdminAuth } from "../../lib/auth";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import DeleteBookButton from "./DeleteBookButton";

export const revalidate = 0; // Disable caching for admin pages

export default async function AdminBooksPage() {
  await requireAdminAuth();

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
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin/dashboard"
                className="text-indigo-600 hover:text-indigo-500"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Manage Books</h1>
              <Link
                href="/admin/books/add"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Add Book
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
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
                No books
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new book.
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/books/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Book
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Books ({books.length})
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your book collection
                </p>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {books.map((book) => (
                    <li key={book.id}>
                      <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            {book.thumbnail ? (
                              <img
                                className="h-16 w-12 object-cover rounded"
                                src={book.thumbnail}
                                alt={book.title}
                              />
                            ) : (
                              <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center">
                                <svg
                                  className="h-6 w-6 text-gray-400"
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
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-indigo-600 truncate">
                                {book.title}
                              </p>
                            </div>
                            <div className="mt-1">
                              <p className="text-sm text-gray-600">
                                by {book.author.name}
                              </p>
                              {book.description && (
                                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                  {book.description}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span>{book._count.reviews} reviews</span>
                              <span>{book._count.myNotes} notes</span>
                              {book.publishedDate && (
                                <span>Published {book.publishedDate}</span>
                              )}
                              {book.pageCount && (
                                <span>{book.pageCount} pages</span>
                              )}
                            </div>
                            {book.categories.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {book.categories
                                  .slice(0, 3)
                                  .map((category, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                                    >
                                      {category}
                                    </span>
                                  ))}
                                {book.categories.length > 3 && (
                                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                    +{book.categories.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-6 flex items-center space-x-3">
                          <Link
                            href={`/books/${book.id}`}
                            target="_blank"
                            className="text-gray-400 hover:text-gray-500"
                            title="View public page"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/books/${book.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <DeleteBookButton
                            bookId={book.id}
                            bookTitle={book.title}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
