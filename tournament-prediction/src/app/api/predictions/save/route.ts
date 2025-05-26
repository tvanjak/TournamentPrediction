import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tournamentId, userId, groupPredictions, eliminationPredictions } = body;

    if (!tournamentId || !userId) {
      return new NextResponse("Missing tournamentId or userId", { status: 400 });
    }

    let prediction = await prisma.predictions.findFirst({
      where: { tournament_id: tournamentId, user_id: userId },
    });

    if (!prediction) {
      prediction = await prisma.predictions.create({
        data: { tournament_id: tournamentId, user_id: userId },
      });
    }

    const predictionId = prediction.id;

    await prisma.group_games_predictions.deleteMany({ where: { prediction_id: predictionId } });
    await prisma.elimination_games_predictions.deleteMany({ where: { prediction_id: predictionId } });

    // GROUP PREDICTIONS
    const groupCreateData = groupPredictions.map((p: any) => ({
      prediction_id: predictionId,
      game_id: p.gameId,
      predicted_result: p.result,
    }));

    if (groupCreateData.length > 0) {
      await prisma.group_games_predictions.createMany({ data: groupCreateData });
    }

    // ELIMINATION PREDICTIONS
    const eliminationCreateData = [];

    for (const p of eliminationPredictions) {
      const game = await prisma.elimination_games.findUnique({
        where: { id: p.gameId },
        select: { team1_id: true, team2_id: true, round_id: true },
      });

      if (!game) continue;

      eliminationCreateData.push({
        prediction_id: predictionId,
        game_id: p.gameId,
        predicted_winner_id: p.predictedWinnerId,
        team1_id: game.team1_id!,
        team2_id: game.team2_id!,
        round_id: game.round_id!,
      });
    }

    if (eliminationCreateData.length > 0) {
      await prisma.elimination_games_predictions.createMany({ data: eliminationCreateData });
    }

    return NextResponse.json({ success: true, predictionId });
  } catch (error) {
    console.error("[SAVE_PREDICTION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
