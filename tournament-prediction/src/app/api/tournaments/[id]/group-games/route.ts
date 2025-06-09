import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const tournamentId = Number(params.id);

  if (isNaN(tournamentId)) {
    return new NextResponse("Invalid tournament ID", { status: 400 });
  }

  try {
    const groupGames = await prisma.group_games.findMany({
      where: { tournament_id: tournamentId },
      include: {
        groups: true,
        team1: {
          select: {
            id: true,
            countries: { select: { name: true } },
          },
        },
        team2: {
          select: {
            id: true,
            countries: { select: { name: true } },
          },
        },
      },
    });

    const rankings = await prisma.group_rankings.findMany({
      where: { tournament_id: tournamentId },
      include: {
        groups: true,
        teams: {
          select: {
            id: true,
            countries: { select: { name: true } },
          },
        },
      },
      orderBy: [{ group_id: "asc" }, { rank: "asc" }],
    });

    const groupedGamesMap: Record<number, any[]> = {};
    const groupIdToNameMap: Record<number, string> = {};

    for (const game of groupGames) {
      const groupId = game.groups?.id;
      const groupName = game.groups?.name ?? "Unknown";

      if (!groupedGamesMap[groupId]) {
        groupedGamesMap[groupId] = [];
        groupIdToNameMap[groupId] = groupName;
      }

      groupedGamesMap[groupId].push({
        id: game.id,
        team1: game.team1,
        team2: game.team2,
        result: game.result ?? null, // match predictions format
        status: game.status ?? "pending",
      });
    }

    const groupedRankingsMap: Record<number, any[]> = {};

    for (const r of rankings) {
      const groupId = r.groups?.id;
      if (!groupedRankingsMap[groupId]) groupedRankingsMap[groupId] = [];

      groupedRankingsMap[groupId].push({
        rank: r.rank,
        points: r.points ?? 0,
        team: r.teams,
      });
    }

    const sortedGroupIds = Object.keys(groupedGamesMap).map(Number).sort((a, b) => a - b);
    const data = sortedGroupIds.map((groupId) => ({
      groupId,
      groupName: groupIdToNameMap[groupId],
      games: groupedGamesMap[groupId],
      rankings: groupedRankingsMap[groupId] ?? [],
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GROUP_GAMES_WITH_RANKINGS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
