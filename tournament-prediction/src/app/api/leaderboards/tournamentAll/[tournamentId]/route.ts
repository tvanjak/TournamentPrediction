import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma-client"; // Adjust path if needed

export async function GET(request: Request, { params }: { params: { tournamentId: string } }) {
  try {
    const { tournamentId } = params;

    if (!tournamentId) {
      console.error("No tournamentId provided in request params.");
      return new NextResponse("Tournament ID is required", { status: 400 });
    }

    // Log tournamentId for debugging
    console.log("Fetching leaderboard for tournamentId:", tournamentId);

    // Query the database to get the tournament's name and all users and their total points in the specified tournament
    const tournamentData = await prisma.tournaments.findUnique({
      where: { id: parseInt(tournamentId) },
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
      console.error(`Tournament with ID ${tournamentId} not found`);
      return new NextResponse("Tournament not found", { status: 404 });
    }

    // Format the leaderboard data
    const leaderboard = tournamentData.tournament_leaderboards.map((entry) => ({
      username: entry.users?.username,
      totalPoints: entry.total_points ?? 0,
      email: entry.users?.email,
      image: entry.users?.image,
    }));

    // Return the tournament name along with the leaderboard data
    return NextResponse.json({
      tournamentName: tournamentData.name,
      leaderboard: leaderboard,
    });
  } catch (error) {
    console.error("[GET_TOURNAMENT_LEADERBOARD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
