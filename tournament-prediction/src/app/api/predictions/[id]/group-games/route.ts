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
      select: {
        id: true,
        predicted_result: true,
        points_awarded: true,
        group_games: {
          select: {
            id: true,
            status: true,
            groups: true,
            team1: {
              select: {
                id: true,
                countries: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            team2: {
              select: {
                id: true,
                countries: {
                  select: {
                    name: true,
                  },
                },
              },
            },
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

    const groupedGamesMap: Record<number, any[]> = {};
    const groupIdToNameMap: Record<number, string> = {};

    for (const prediction of predictions) {
      const game = prediction.group_games;
      const groupId = game?.groups?.id;
      const groupName = game?.groups?.name ?? "Unknown";
    
      if (groupId == null) continue;
    
      if (!groupedGamesMap[groupId]) {
        groupedGamesMap[groupId] = [];
        groupIdToNameMap[groupId] = groupName;
      }
    
      groupedGamesMap[groupId].push({
        id: game?.id,
        team1: game?.team1,
        team2: game?.team2,
        predicted_result: prediction.predicted_result ?? null,
        status: game.status,
        points_awarded: prediction.points_awarded,
      });
    }

    const groupedRankingsMap: Record<number, any[]> = {};

    for (const r of rankings) {
      const groupId = r.group_id;
    
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
    console.error("[PREDICTION_GROUP_GAMES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
