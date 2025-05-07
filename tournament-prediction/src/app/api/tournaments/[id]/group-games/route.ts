import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

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
        team1: { include: { countries: { select: { name: true } } } },
        team2: { include: { countries: { select: { name: true } } } },
      },
    });

    const rankings = await prisma.group_rankings.findMany({
      where: { tournament_id: tournamentId },
      include: {
        groups: true,
        teams: {
          include: {
            countries: { select: { name: true } },
          },
        },
      },
      orderBy: [{ group_id: "asc" }, { rank: "asc" }],
    });

    // Group games by group name
    const groupedGamesMap: Record<string, any[]> = {};
    for (const game of groupGames) {
      const groupName = game.groups?.name ?? "Unknown";
      if (!groupedGamesMap[groupName]) groupedGamesMap[groupName] = [];
      groupedGamesMap[groupName].push(game);
    }

    // Group rankings by group name
    const groupedRankingsMap: Record<string, any[]> = {};
    for (const r of rankings) {
      const groupName = r.groups?.name ?? "Unknown";
      if (!groupedRankingsMap[groupName]) groupedRankingsMap[groupName] = [];
      groupedRankingsMap[groupName].push(r);
    }

    // Create ordered array of groups
    const sortedGroupNames = Object.keys(groupedGamesMap).sort();
    const data = sortedGroupNames.map((groupName) => ({
      groupName,
      games: groupedGamesMap[groupName],
      rankings: groupedRankingsMap[groupName] ?? [],
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GROUP_GAMES_WITH_RANKINGS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
