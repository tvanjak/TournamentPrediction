// app/api/predictions/[id]/group-games/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const predictionId = Number(params.id);
  if (isNaN(predictionId)) {
    return new NextResponse("Invalid prediction ID", { status: 400 });
  }

  try {
    const predictions = await prisma.group_games_predictions.findMany({
      where: { prediction_id: predictionId },
      include: {
        group_games: {
          include: {
            groups: true,
            team1: { include: { countries: { select: { name: true } } } },
            team2: { include: { countries: { select: { name: true } } } },
          },
        },
      },
    });

    const rankings = await prisma.group_rankings_predictions.findMany({
      where: { prediction_id: predictionId },
      include: {
        groups: true,
        teams: {
          include: { countries: { select: { name: true } } },
        },
      },
      orderBy: [{ group_id: "asc" }, { rank: "asc" }],
    });

    const groupedGamesMap: Record<string, any[]> = {};
    for (const prediction of predictions) {
      const game = prediction.group_games;
      const groupName = game?.groups?.name ?? "Unknown";

      if (!groupedGamesMap[groupName]) groupedGamesMap[groupName] = [];
      groupedGamesMap[groupName].push({
        id: game?.id,
        team1: game?.team1,
        team2: game?.team2,
        predicted_result: prediction.predicted_result ?? null,
      });
    }

    const groupedRankingsMap: Record<string, any[]> = {};
    for (const r of rankings) {
      const groupName = r.groups?.name ?? "Unknown";
      if (!groupedRankingsMap[groupName]) groupedRankingsMap[groupName] = [];
      groupedRankingsMap[groupName].push({
        rank: r.rank,
        points: r.points ?? 0,
        team: r.teams,
      });
    }

    const sortedGroupNames = Object.keys(groupedGamesMap).sort();
    const data = sortedGroupNames.map((groupName) => ({
      groupName,
      games: groupedGamesMap[groupName],
      rankings: groupedRankingsMap[groupName] ?? [],
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[PREDICTION_GROUP_GAMES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
