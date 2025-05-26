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
      select: {
        id: true,
        predicted_winner_id: true,
        points_awarded: true,
        rounds: true,
        team1: {
          include: {countries: { select: { name: true}}}
        },
        team2: {
          include: {countries: { select: { name: true}}}
        },
        team_winner: {
          include: { countries: { select: { name: true } } },
        },
        elimination_games: {
          select: {
            status: true,
          }
        }
      },
    });
    
        //elimination_games: {
        //  include: {
        //    rounds: true,
        //    team1: { include: { countries: { select: { name: true } } } },
        //    team2: { include: { countries: { select: { name: true } } } },
        //    team_winner: { include: { countries: { select: { name: true } } } },
        //  },
        //},

    const groupedByRound = predictions.reduce((acc, prediction) => {
      const roundName = prediction?.rounds?.name ?? "Unknown";

      if (!acc[roundName]) acc[roundName] = [];

      acc[roundName].push({
        id: prediction?.id,
        team1: prediction?.team1,
        team2: prediction?.team2,
        rounds: prediction?.rounds,
        predicted_winner_id: prediction.predicted_winner_id,
        points_awarded: prediction.points_awarded,
        status: prediction.elimination_games?.status
      });

      return acc;
    }, {} as Record<string, any[]>);

    const result = Object.entries(groupedByRound).map(([roundName, games]) => ({
      roundName,
      roundId: games[0]?.rounds?.id ?? null,  // add this line to pick roundId from first game's rounds relation
      games,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PREDICTION_ELIMINATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
