import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"; 
import { TournamentStatusEnum } from "@/types/enums";

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const userId = parseInt(id)

    const leaderboardEntry = await prisma.all_time_leaderboard.findUnique({
      where: { user_id: userId },
      select: { average_points: true, total_points: true },
    });

    const tournamentCount = await prisma.tournament_leaderboards.count({
      where: {
        user_id: userId,
      },
    });

    const tournamentsAndGroupsData = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        predictions: {
          where: {
            tournaments: {
              status: TournamentStatusEnum.Completed,
            },
          },
          select: {
            tournament_id: true,
            tournaments: {
              select: {
                name: true,
              },
            }
          },
        },
        user_group_members: {
          select: {
            user_group_id: true,
          },
        },
      },
    });

    const tournamentsData = tournamentsAndGroupsData?.predictions.map(p => ({
      id: p.tournament_id,
      name: p.tournaments.name,
    })) ?? [];
    const userGroupIds = tournamentsAndGroupsData?.user_group_members.map(g => g.user_group_id) ?? [];



    if (!leaderboardEntry ) {
      return new NextResponse("User not found in leaderboard", { status: 404 });
    }

    // Return the average points as JSON
    return NextResponse.json({ 
        averagePoints: leaderboardEntry.average_points,
        totalPoints: leaderboardEntry.total_points,
        tournamentsPlayed: tournamentCount,
        tournamentsData,
        userGroupIds
     });
  } catch (error) {
    console.error("[GET_AVERAGE_POINTS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
