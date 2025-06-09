import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(request: Request, context: { params: { tournamentId: string } }) {
  try {
    const { tournamentId } = context.params;
    
    if (!tournamentId) {
      console.error("No tournamentId provided in request params.");
      return new NextResponse("Tournament ID is required", { status: 400 });
    }
    
    const parsedTournamentId = parseInt(tournamentId);
    
    const tournamentData = await prisma.tournaments.findUnique({
      where: { id: parsedTournamentId },
      select: {
        name: true, // Tournament name
        tournament_leaderboards: {
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
            total_points: "desc", // Order by total points, descending
          },
        },
      },
    });

    if (!tournamentData) {
      console.error(`Tournament with ID ${parsedTournamentId} not found`);
      return new NextResponse("Tournament not found", { status: 404 });
    }

    // Format the leaderboard data
    const leaderboard = tournamentData.tournament_leaderboards.map((entry) => ({
      username: entry.users?.username,
      totalPoints: entry.total_points ?? 0,
    }));

    // Return the tournament name along with the leaderboard data
    return NextResponse.json({
      tournamentName: tournamentData.name,
      users: leaderboard,
    });
  } catch (error) {
    console.error("[GET_TOURNAMENT_LEADERBOARD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
