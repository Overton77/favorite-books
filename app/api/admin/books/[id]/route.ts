import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/prisma";

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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
    } = body;

    // Validate required fields
    if (!title || !authorName) {
      return NextResponse.json(
        { error: "Title and author name are required" },
        { status: 400 }
      );
    }

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Find or create author if changed
    let author = existingBook.author;
    if (author.name !== authorName) {
      const foundAuthor = await prisma.author.findUnique({
        where: { name: authorName },
      });

      if (foundAuthor) {
        author = foundAuthor;
      } else {
        author = await prisma.author.create({
          data: { name: authorName },
        });
      }
    }

    // Update book
    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title,
        authorId: author.id,
        description,
        publishedDate,
        pageCount: pageCount ? parseInt(pageCount) : null,
        thumbnail,
        isbn10,
        isbn13,
        categories: Array.isArray(categories) ? categories : [],
      },
      include: {
        author: true,
      },
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Delete book (this will cascade delete reviews and notes)
    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
