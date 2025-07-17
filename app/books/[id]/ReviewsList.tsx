"use client";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

interface ReviewsListProps {
  initialReviews: Review[];
  bookId: string;
}

export default function ReviewsList({ initialReviews }: ReviewsListProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (initialReviews.length === 0) {
    return (
      <div className="text-center py-6">
        <svg
          className="mx-auto h-8 w-8 text-gray-400"
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
        <p className="mt-2 text-sm text-gray-500">No reviews yet</p>
        <p className="text-xs text-gray-400">
          Be the first to review this book!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialReviews.map((review) => (
        <div
          key={review.id}
          className="border-b border-gray-200 pb-4 last:border-b-0"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h5 className="text-sm font-medium text-gray-900">
                  {review.reviewerName}
                </h5>
                {renderStars(review.rating)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {review.comment && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
