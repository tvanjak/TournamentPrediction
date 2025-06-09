import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { TournamentStatusEnum } from "@/types/enums";

export async function GET(
  req: NextRequest,
  context : { params: { userId: string } }
) {
  const { userId } = context.params; 
  const parsedUserId = parseInt(userId, 10);

  if (isNaN(parsedUserId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    // Fetch only groups that include the given user
    const userGroups = await prisma.user_groups.findMany({
      where: {
        user_group_members: {
          some: {
            user_id: parsedUserId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        user_group_members: {
          include: {
            users: {
              include: {
                predictions: {
                  where: {
                    tournaments: {
                      status: TournamentStatusEnum.Ongoing,
                    },
                  },
                  select: {
                    id: true,
                    tournaments: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });


    // Format the userGroups
    const userGroupsData = userGroups.map((group) => ({
      groupId: group.id,
      groupName: group.name,
      createdBy: {
        id: group.users?.id,
        username: group.users?.username,
      },
      users: group.user_group_members.map((member) => ({
        userId: member.users.id,
        username: member.users.username,
        predictions: member.users.predictions.map((p) => ({
          id: p.id,
          tournamentName: p.tournaments.name,
        })),
      })),
    }));

    return NextResponse.json(userGroupsData);
  } catch (error: any) {
    console.error("Error fetching grouped users:", error);
    return NextResponse.json(
      { error: "Failed to fetch grouped user data" },
      { status: 500 }
    );
  }
}
