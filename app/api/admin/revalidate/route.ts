import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Revalidate all book-related pages
    revalidatePath("/");
    revalidatePath("/books");
    revalidatePath("/books/[id]", "page");

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    console.error("Error during revalidation:", error);
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
