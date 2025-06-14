export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

import { Team, PredictionGroupGamesType, PredictionEliminationGamesType } from "@/types/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { predictionId, groupGames, eliminationGames, champion } = body;

    const GroupPredictions = groupGames as PredictionGroupGamesType[];
    const EliminationPredictions = eliminationGames as PredictionEliminationGamesType[];
    const typedChampion = champion as Team | null | undefined;

    if (isNaN(predictionId)) {
      return new NextResponse("Missing predictionId", { status: 400 });
    }

    const parsedPredictionId = Number(predictionId);

    await prisma.$transaction(async (tx) => {
      for (const group of GroupPredictions) {
        for (const game of group.games) {
          const existingGroupGamePrediction = await tx.group_games_predictions.findUnique({
            where: {
              prediction_id_game_id: {
                prediction_id: parsedPredictionId,
                game_id: game.id,
              },
            },
          });

          if (existingGroupGamePrediction) {
            await tx.group_games_predictions.update({
              where: {
                id: existingGroupGamePrediction.id,
              },
              data: {
                predicted_result: game.predicted_result ?? null,
                points_awarded: game.points_awarded ?? null,
                modified_at: new Date(),
              },
            });
          } else {
            await tx.group_games_predictions.create({
              data: {
                prediction_id: parsedPredictionId,
                game_id: game.id,
                predicted_result: game.predicted_result ?? null,
                points_awarded: game.points_awarded ?? null,
              },
            });
          }
        }

        for (const ranking of group.rankings) {
          const existingGroupRankingPrediction = await tx.group_rankings_predictions.findUnique({
            where: {
              prediction_id_group_id_team_id: {
                prediction_id: parsedPredictionId,
                group_id: group.groupId,
                team_id: ranking.team.id,
              },
            },
          });

          if (existingGroupRankingPrediction) {
            await tx.group_rankings_predictions.update({
              where: {
                id: existingGroupRankingPrediction.id,
              },
              data: {
                points: ranking.points,
                rank: ranking.rank,
                modified_at: new Date(),
              },
            });
          } else {
            await tx.group_rankings_predictions.create({
              data: {
                prediction_id: parsedPredictionId,
                group_id: group.groupId,
                team_id: ranking.team.id,
                points: ranking.points,
                rank: ranking.rank,
              },
            });
          }
        }
      }

      for (const round of EliminationPredictions) {
        for (const game of round.games) {
          if (!Number.isInteger(game.actual_game_id)) continue;

          const existingEliminationPrediction = await tx.elimination_games_predictions.findUnique({
            where: {
              prediction_id_game_id: {
                prediction_id: parsedPredictionId,
                game_id: game.actual_game_id,
              },
            },
          });

          if (existingEliminationPrediction) {
            await tx.elimination_games_predictions.update({
              where: {
                id: existingEliminationPrediction.id,
              },
              data: {
                predicted_winner_id: game.predicted_winner_id ?? null,
                points_awarded: game.points_awarded ?? null,
                round_id: round.roundId,
                team1_id: game.team1?.id ?? null,
                team2_id: game.team2?.id ?? null,
                modified_at: new Date(),
              },
            });
          } else {
            await tx.elimination_games_predictions.create({
              data: {
                prediction_id: parsedPredictionId,
                game_id: game.actual_game_id,
                predicted_winner_id: game.predicted_winner_id ?? null,
                points_awarded: game.points_awarded ?? null,
                round_id: round.roundId,
                team1_id: game.team1?.id ?? null,
                team2_id: game.team2?.id ?? null,
              },
            });
          }
        }
      }

      if (typedChampion?.id && Number.isInteger(typedChampion.id)) {
        await tx.predictions.update({
          where: { id: parsedPredictionId },
          data: {
            predicted_champion_id: typedChampion.id,
            modified_at: new Date(),
          },
        });
      }
    });

    return NextResponse.json({ success: true, parsedPredictionId });
  } catch (error) {
    console.error("[SAVE_PREDICTION_ERROR]", error);
    return new NextResponse(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500 }
    );
  }
}
