import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

export async function GET() {
  try {
    const leaderboard = await prisma.all_time_leaderboard.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        total_points: "desc",
      },
    });

    const formatted = leaderboard.map((entry) => ({
      username: entry.users?.username,
      totalPoints: entry.total_points ?? 0,
      averagePoints: entry.average_points ?? 0,
      tournamentsPlayed: entry.tournaments_played ?? 0,
    }));

    return NextResponse.json({ users: formatted });
  } catch (error) {
    console.error("[GET_LEADERBOARD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
