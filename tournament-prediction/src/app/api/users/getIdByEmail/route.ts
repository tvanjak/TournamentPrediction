import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email: email },
      select: { id: true, is_admin: true },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({ userId: user.id, isAdmin: user.is_admin });
  } catch (error) {
    console.error("[GET_USER_ID_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
