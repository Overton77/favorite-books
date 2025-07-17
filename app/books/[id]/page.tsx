import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../lib/prisma";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";

export const revalidate = 60; // Revalidate every minute for review updates

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      author: true,
      reviews: {
        orderBy: { createdAt: "desc" },
      },
      myNotes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!book) {
    notFound();
  }

  // Calculate average rating
  const averageRating =
    book.reviews.length > 0
      ? book.reviews.reduce((sum, review) => sum + review.rating, 0) /
        book.reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link
                href="/books"
                className="text-indigo-600 hover:text-indigo-500"
              >
                ← Back to Books
              </Link>
            </div>
            <div>
              <Link href="/" className="text-gray-600 hover:text-gray-500">
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Book Information */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {book.thumbnail ? (
                        <img
                          className="h-64 w-48 object-cover rounded-lg shadow-md"
                          src={book.thumbnail}
                          alt={book.title}
                        />
                      ) : (
                        <div className="h-64 w-48 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
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
                    <div className="ml-6 flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {book.title}
                      </h1>
                      <p className="text-xl text-gray-600 mb-4">
                        by {book.author.name}
                      </p>

                      {/* Rating Display */}
                      {book.reviews.length > 0 && (
                        <div className="flex items-center mb-4">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= averageRating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-500">
                            {averageRating.toFixed(1)} ({book.reviews.length}{" "}
                            review{book.reviews.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                      )}

                      {/* Categories */}
                      {book.categories.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {book.categories.map((category, index) => (
                              <span
                                key={index}
                                className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Book Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                        {book.publishedDate && (
                          <div>
                            <span className="font-medium">Published:</span>{" "}
                            {book.publishedDate}
                          </div>
                        )}
                        {book.pageCount && (
                          <div>
                            <span className="font-medium">Pages:</span>{" "}
                            {book.pageCount}
                          </div>
                        )}
                        {book.isbn10 && (
                          <div>
                            <span className="font-medium">ISBN-10:</span>{" "}
                            {book.isbn10}
                          </div>
                        )}
                        {book.isbn13 && (
                          <div>
                            <span className="font-medium">ISBN-13:</span>{" "}
                            {book.isbn13}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {book.description && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Description
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {book.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* My Notes Section */}
              {book.myNotes.length > 0 && (
                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Personal Notes
                    </h3>
                    <div className="space-y-4">
                      {book.myNotes.map((note) => (
                        <div
                          key={note.id}
                          className="border-l-4 border-indigo-500 pl-4"
                        >
                          <h4 className="font-medium text-gray-900">
                            {note.title}
                          </h4>
                          <p className="text-gray-700 mt-1">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Reviews ({book.reviews.length})
                  </h3>

                  {/* Review Form */}
                  <ReviewForm bookId={book.id} />

                  {/* Reviews List */}
                  <div className="mt-8">
                    <ReviewsList
                      initialReviews={book.reviews}
                      bookId={book.id}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
