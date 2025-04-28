import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"; // Adjust path if needed

export async function GET(request: Request, { params }: { params: { tournamentId: string, groupId: string } }) {
  try {
    const { tournamentId, groupId } = params;

    if (!tournamentId || !groupId) {
      console.error("No tournamentId or groupId provided in request params.");
      return new NextResponse("Tournament ID and Group ID are required", { status: 400 });
    }

    // Log tournamentId and groupId for debugging
    console.log("Fetching leaderboard for tournamentId:", tournamentId, "and groupId:", groupId);

    // Query the database to get users in the specified group and their points in the tournament
    const leaderboard = await prisma.tournament_leaderboards.findMany({
      where: {
        tournament_id: parseInt(tournamentId),
        user_id: {
          in: await prisma.user_group_members.findMany({
            where: { user_group_id: parseInt(groupId) },
            select: { user_id: true },
          }).then((members) => members.map((member) => member.user_id)),
        },
      },
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
    });

    if (leaderboard.length === 0) {
      console.error(`No users found for tournamentId: ${tournamentId} in groupId: ${groupId}`);
      return new NextResponse("No participants found for the tournament and group", { status: 404 });
    }

    // Format the leaderboard data to return
    const formattedLeaderboard = leaderboard.map((entry) => ({
      username: entry.users?.username,
      totalPoints: entry.total_points ?? 0,
      email: entry.users?.email,
      image: entry.users?.image,
    }));

    // Return the leaderboard data as JSON
    return NextResponse.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error("[GET_TOURNAMENT_GROUP_LEADERBOARD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
