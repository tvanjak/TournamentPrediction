import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Try a simple query to verify the connection
    const userCount = await prisma.users.count();
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount
    });
  } catch (error) {
    console.error("Database connection error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: String(error)
    }, { status: 500 });
  }
}