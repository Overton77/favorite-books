import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../lib/prisma";
import { getBookByQuery } from "../../../lib/google-books";

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      authorName,
      description,
      publishedDate,
      pageCount,
      thumbnail,
      isbn10,
      isbn13,
      categories = [],
      searchGoogle = false,
    } = body;

    // Validate required fields
    if (!title || !authorName) {
      return NextResponse.json(
        { error: "Title and author name are required" },
        { status: 400 }
      );
    }

    let bookData = {
      title,
      description,
      publishedDate,
      pageCount: pageCount ? parseInt(pageCount) : null,
      thumbnail,
      isbn10,
      isbn13,
      categories: Array.isArray(categories) ? categories : [],
      googleBooksId: null as string | null,
    };

    // If searchGoogle is true, try to get data from Google Books API
    if (searchGoogle) {
      try {
        const googleBookData = await getBookByQuery(authorName, title);
        if (googleBookData) {
          bookData = {
            ...bookData,
            description: bookData.description || googleBookData.description,
            publishedDate:
              bookData.publishedDate || googleBookData.publishedDate,
            pageCount: bookData.pageCount ?? googleBookData.pageCount ?? null,
            thumbnail: bookData.thumbnail || googleBookData.thumbnail,
            isbn10: bookData.isbn10 || googleBookData.isbn10,
            isbn13: bookData.isbn13 || googleBookData.isbn13,
            categories:
              bookData.categories.length > 0
                ? bookData.categories
                : googleBookData.categories,
            googleBooksId: googleBookData.googleBooksId,
          };
        }
      } catch (error) {
        console.warn(
          "Failed to fetch from Google Books, proceeding with manual data:",
          error
        );
      }
    }

    // Find or create author
    let author = await prisma.author.findUnique({
      where: { name: authorName },
    });

    if (!author) {
      author = await prisma.author.create({
        data: { name: authorName },
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
      include: {
        author: true,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
