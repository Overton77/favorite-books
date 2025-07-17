import { NextRequest, NextResponse } from "next/server";
import { getBookByQuery } from "../../../../lib/google-books";
import { prisma } from "../../../../lib/prisma";
import { cookies } from "next/headers";

// Initial books to seed
const INITIAL_BOOKS = [
  { author: "Ray Kurzweil", title: "The Singularity is Near" },
  { author: "Ray Kurzweil", title: "The Singularity is Nearer" },
  { author: "Ray Kurzweil", title: "How To Create A Mind" },
  { author: "Dave Asprey", title: "Smarter Not Harder" },
  { author: "Dave Asprey", title: "Heavily Meditated" },
  { author: "Marijn Haverbeke", title: "Eloquent JavaScript" },
  { author: "Joe Dispenza", title: "Becoming Supernatural" },
];

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = [];
    const errors = [];

    for (const bookInfo of INITIAL_BOOKS) {
      try {
        console.log(`Processing: ${bookInfo.author} - ${bookInfo.title}`);

        // Check if book already exists
        const existingBook = await prisma.book.findFirst({
          where: {
            title: {
              contains: bookInfo.title,
              mode: "insensitive",
            },
            author: {
              name: {
                contains: bookInfo.author,
                mode: "insensitive",
              },
            },
          },
        });

        if (existingBook) {
          results.push({
            title: bookInfo.title,
            author: bookInfo.author,
            status: "skipped",
            reason: "Already exists",
          });
          continue;
        }

        // Get book data from Google Books API
        const bookData = await getBookByQuery(bookInfo.author, bookInfo.title);

        if (!bookData) {
          errors.push({
            title: bookInfo.title,
            author: bookInfo.author,
            error: "Not found in Google Books",
          });
          continue;
        }

        // Find or create author
        let author = await prisma.author.findUnique({
          where: { name: bookData.author },
        });

        if (!author) {
          author = await prisma.author.create({
            data: {
              name: bookData.author,
            },
          });
        }

        // Create book
        const book = await prisma.book.create({
          data: {
            title: bookData.title,
            authorId: author.id,
            description: bookData.description,
            publishedDate: bookData.publishedDate,
            pageCount: bookData.pageCount,
            thumbnail: bookData.thumbnail,
            googleBooksId: bookData.googleBooksId,
            isbn10: bookData.isbn10,
            isbn13: bookData.isbn13,
            categories: bookData.categories,
          },
        });

        results.push({
          title: book.title,
          author: author.name,
          status: "created",
          id: book.id,
        });

        // Add a delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `Error processing ${bookInfo.author} - ${bookInfo.title}:`,
          error
        );
        errors.push({
          title: bookInfo.title,
          author: bookInfo.author,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total: INITIAL_BOOKS.length,
        created: results.filter((r) => r.status === "created").length,
        skipped: results.filter((r) => r.status === "skipped").length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: "Internal server error during seeding" },
      { status: 500 }
    );
  }
}
