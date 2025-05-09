// app/api/predictions/[id]/elimination-games/route.ts
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
    const predictions = await prisma.elimination_games_predictions.findMany({
      where: { prediction_id: predictionId },
      include: {
        elimination_games: {
          include: {
            rounds: true,
            team1: { include: { countries: { select: { name: true } } } },
            team2: { include: { countries: { select: { name: true } } } },
          },
        },
        team_winner: {
          include: { countries: { select: { name: true } } },
        },
      },
    });

    const groupedByRound = predictions.reduce((acc, prediction) => {
      const game = prediction.elimination_games;
      const roundName = game?.rounds?.name ?? "Unknown";

      if (!acc[roundName]) acc[roundName] = [];

      acc[roundName].push({
        id: game?.id,
        team1: game?.team1,
        team2: game?.team2,
        rounds: game?.rounds,
        predicted_winner_id: prediction.predicted_winner_id,
        predicted_winner: prediction.team_winner,
        result: game?.status ?? null,
      });

      return acc;
    }, {} as Record<string, any[]>);

    const result = Object.entries(groupedByRound).map(([name, games]) => ({
      name,
      games,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PREDICTION_ELIMINATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
