import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"; // Adjust the path if needed

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Extract the id from URL params
    const { id } = params;

    // Query the database to find the user's average points
    const leaderboardEntry = await prisma.all_time_leaderboard.findUnique({
      where: { user_id: parseInt(id) },
      select: { average_points: true },
    });

    if (!leaderboardEntry) {
      return new NextResponse("User not found in leaderboard", { status: 404 });
    }

    // Return the average points as JSON
    return NextResponse.json({ averagePoints: leaderboardEntry.average_points });
  } catch (error) {
    console.error("[GET_AVERAGE_POINTS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
