import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(
  request: Request,
  context: { params: { groupId: string } }
) {
  try {
    const { groupId } = context.params; 
    const parsedGroupId = parseInt(groupId);

    if (isNaN(parsedGroupId)) {
      return new NextResponse("Invalid or missing groupId", { status: 400 });
    }

    const group = await prisma.user_groups.findUnique({
      where: {
        id: parsedGroupId,
      },
      include: {
        user_group_members: {
          select: {
            users: {
              select: {
                id: true,
                username: true,
                email: true,
                image: true,
                all_time_leaderboard: {
                  select: {
                    total_points: true,
                    average_points: true,
                    tournaments_played: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!group) {
      return new NextResponse("Group not found", { status: 404 });
    }

    const formattedGroup = {
      groupName: group.name,
      users: group.user_group_members
        .filter((member) => member.users !== null)
        .map((member) => ({
          username: member.users?.username,
          totalPoints: member.users?.all_time_leaderboard?.total_points ?? 0,
          averagePoints: member.users?.all_time_leaderboard?.average_points ?? 0,
          tournamentsPlayed: member.users?.all_time_leaderboard?.tournaments_played ?? 0,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints),
    };

    return NextResponse.json(formattedGroup);
  } catch (error) {
    console.error("[GET_GROUP_LEADERBOARD_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
