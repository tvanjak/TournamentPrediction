import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(request: Request, context: { params: { tournamentId: string, groupId: string } }) {
  try {
    const { tournamentId, groupId } = context.params;

    if (!tournamentId || !groupId) {
      console.error("No tournamentId or groupId provided in request params.");
      return new NextResponse("Tournament ID and Group ID are required", { status: 400 });
    }

    const tournamentIdInt = parseInt(tournamentId);
    const groupIdInt = parseInt(groupId);

    console.log("Fetching leaderboard for tournamentId:", tournamentIdInt, "and groupId:", groupIdInt);

    // Fetch tournament name
    const tournament = await prisma.tournaments.findUnique({
      where: { id: tournamentIdInt },
      select: { name: true },
    });

    if (!tournament) {
      return new NextResponse("Tournament not found", { status: 404 });
    }

    // Fetch group name
    const group = await prisma.user_groups.findUnique({
      where: { id: groupIdInt },
      select: { name: true },
    });

    if (!group) {
      return new NextResponse("User group not found", { status: 404 });
    }

    // Get user IDs in group
    const userIds = await prisma.user_group_members.findMany({
      where: { user_group_id: groupIdInt },
      select: { user_id: true },
    }).then((members) => members.map((member) => member.user_id));

    // Get leaderboard entries
    const leaderboard = await prisma.tournament_leaderboards.findMany({
      where: {
        tournament_id: tournamentIdInt,
        user_id: { in: userIds },
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
        total_points: "desc",
      },
    });

    if (!leaderboard) {
      console.error(`Tournament with ID ${tournamentId} not found`);
      return new NextResponse("Tournament not found", { status: 404 });
    }

    const formattedLeaderboard = leaderboard.map((entry) => ({
      username: entry.users?.username,
      totalPoints: entry.total_points ?? 0,
    }));

    // Return leaderboard with tournament and group names
    return NextResponse.json({
      tournamentName: tournament.name,
      groupName: group.name,
      users: formattedLeaderboard,
    });
  } catch (error) {
    console.error("[GET_TOURNAMENT_GROUP_LEADERBOARD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
