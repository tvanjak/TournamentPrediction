import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupIds } = body;

    if (!Array.isArray(groupIds) || groupIds.length === 0) {
      return new NextResponse("groupIds must be a non-empty array", { status: 400 });
    }

    const groups = await prisma.user_groups.findMany({
      where: {
        id: {
          in: groupIds,
        },
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

    const formattedGroups = groups.map((group) => ({
      groupName: group.name,
      users: group.user_group_members
        .filter((member) => member.users !== null)
        .map((member) => ({
          username: member.users?.username,
          email: member.users?.email,
          image: member.users?.image,
          totalPoints: member.users?.all_time_leaderboard?.total_points ?? 0,
          averagePoints: member.users?.all_time_leaderboard?.average_points ?? 0,
          tournamentsPlayed: member.users?.all_time_leaderboard?.tournaments_played ?? 0,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints),
    }));

    return NextResponse.json(formattedGroups);
  } catch (error) {
    console.error("[POST_GROUP_LEADERBOARDS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
