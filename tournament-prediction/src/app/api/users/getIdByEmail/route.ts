import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma-client"; // Adjust the path if needed

export async function GET(request: Request) {
  try {
    // Extract the email parameter from the query string
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    // Ensure email is provided
    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    // Query the database to find the user by email
    const user = await prisma.users.findUnique({
      where: { email: email },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Return the user ID as JSON
    return NextResponse.json({ userId: user.id });
  } catch (error) {
    console.error("[GET_USER_ID_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
