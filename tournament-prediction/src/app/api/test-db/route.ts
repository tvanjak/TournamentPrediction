import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

export async function GET() {
  try {
    // Test direct database operations
    console.log("Testing direct database operations");
    
    // Count users
    const userCount = await prisma.users.count();
    console.log("User count:", userCount);
    
    // Get all users (limit to 10)
    const users = await prisma.users.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        image: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      userCount,
      users,
    });
  } catch (error) {
    console.error("Database error:", error);
    
    return NextResponse.json({
      success: false,
      error: String(error),
      stack: (error as Error).stack,
    }, { status: 500 });
  }
}