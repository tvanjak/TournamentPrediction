import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import {
  Prisma,
  group_games,
  elimination_games,
  group_rankings,
} from "@prisma/client";

export async function POST(req: Request) {
  let groupGames: group_games[] = [];
  let eliminationGames: elimination_games[] = [];
  let rankings: group_rankings[] = [];

  let groupCreateData: Prisma.group_games_predictionsCreateManyInput[] = [];
  let eliminationCreateData: Prisma.elimination_games_predictionsCreateManyInput[] = [];
  let rankingsCreateData: Prisma.group_rankings_predictionsCreateManyInput[] = [];

  try {
    const body = await req.json();
    const { userId, tournamentId } = body;
    const parsedUserId = Number(userId);
    const parsedTournamentId = Number(tournamentId);

    if (isNaN(parsedUserId) || isNaN(parsedTournamentId)) {
      return NextResponse.json(
        { success: false, message: "Missing userId or tournamentId" },
        { status: 400 }
      );
    }

    let prediction = await prisma.predictions.findFirst({
      where: {
        tournament_id: parsedTournamentId,
        user_id: parsedUserId,
      },
    });

    if (!prediction) {
      // Fetch necessary data
      groupGames = await prisma.group_games.findMany({
        where: { tournament_id: parsedTournamentId },
      });

      eliminationGames = await prisma.elimination_games.findMany({
        where: { tournament_id: parsedTournamentId },
      });

      rankings = await prisma.group_rankings.findMany({
        where: { tournament_id: parsedTournamentId },
      });

      // Start transaction
      await prisma.$transaction(async (tx) => {
        // Create prediction
        const newPrediction = await tx.predictions.create({
          data: {
            tournament_id: parsedTournamentId,
            user_id: parsedUserId,
          },
        });

        const predictionId = newPrediction.id;

        // Prepare data
        groupCreateData = groupGames.map((gg) => ({
          prediction_id: predictionId,
          game_id: gg.id,
        }));

        eliminationCreateData = eliminationGames.map((eg) => ({
          prediction_id: predictionId,
          game_id: eg.id,
          round_id: eg.round_id,
        }));

        rankingsCreateData = rankings.map((r) => ({
          prediction_id: predictionId,
          group_id: r.group_id,
          team_id: r.team_id,
          points: 0,
          rank: 0,
        }));

        // Create prediction-related rows
        await tx.group_games_predictions.createMany({ data: groupCreateData });
        await tx.elimination_games_predictions.createMany({ data: eliminationCreateData });
        await tx.group_rankings_predictions.createMany({ data: rankingsCreateData });

        // Initialize tournament_leaderboards if not exists
        await tx.tournament_leaderboards.upsert({
          where: {
            tournament_id_user_id: {
              tournament_id: parsedTournamentId,
              user_id: parsedUserId,
            },
          },
          update: {}, // no update needed
          create: {
            tournament_id: parsedTournamentId,
            user_id: parsedUserId,
            total_points: 0,
          },
        });

        // Initialize all_time_leaderboard if not exists
        await tx.all_time_leaderboard.upsert({
          where: { user_id: parsedUserId },
          update: {
            tournaments_played: {
              increment: 1,
            },
          }, // no update needed
          create: {
            user_id: parsedUserId,
            total_points: 0,
            average_points: 0,
            tournaments_played: 1,
          },
        });

        prediction = newPrediction;
      });
    }

    const predictionId = prediction!.id;
    const championPoints = prediction!.champion_points;

    return NextResponse.json({ success: true, predictionId, championPoints });
  } catch (error) {
    console.error("[GET_PREDICTION_ID_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
