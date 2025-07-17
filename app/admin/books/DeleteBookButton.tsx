"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteBookButtonProps {
  bookId: string;
  bookTitle: string;
}

export default function DeleteBookButton({
  bookId,
  bookTitle,
}: DeleteBookButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh(); // Refresh the page to show updated list
      } else {
        console.error("Failed to delete book");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500">Delete "{bookTitle}"?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 text-xs font-medium disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-gray-600 hover:text-gray-700 text-xs font-medium"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-700 text-sm font-medium"
    >
      Delete
    </button>
  );
}
