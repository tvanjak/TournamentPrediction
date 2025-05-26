import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { StatusEnum, ResultEnum } from "@/types/enums";
import { Prisma } from "@prisma/client"

interface Team {
    id: number;
    countries?: { name: string };
}

type GroupGames = {
    groupId: number;
    groupName: string;
    games: {
        id: number;
        team1?: Team;
        team2?: Team;
        predicted_result?: ResultEnum;
        points_awarded: number;
        status: StatusEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        team: Team;
    }[];
};

interface EliminationGames {
    roundName: string;
    roundId: number;
    games: {
        id: number;
        actual_game_id: number;
        rounds?: { name: string };
        team1?: Team; // allow placeholders like "A1"???
        team2?: Team;
        predicted_winner_id?: number;
        points_awarded?: number;
        status: StatusEnum;
    }[];
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tournamentId, userId, groupGames, eliminationGames, champion } = body;

    const GroupPredictions = groupGames as GroupGames[]
    const EliminationPredictions = eliminationGames as EliminationGames[]
    const typedChampion = champion as Team | null | undefined;

    if (isNaN(tournamentId) || isNaN(userId)) {
      return new NextResponse("Missing tournamentId or userId", { status: 400 });
    }
    
    const parsedUserId = Number(userId);
    const parsedTournamentId = Number(tournamentId);

    let prediction = await prisma.predictions.findFirst({
      where: { tournament_id: parsedTournamentId, user_id: parsedUserId },
    });

    if (!prediction) {
      prediction = await prisma.predictions.create({
        data: { tournament_id: parsedTournamentId, user_id: parsedUserId },
      });
    }

    const predictionId = prediction.id;

    await prisma.group_games_predictions.deleteMany({ where: { prediction_id: predictionId } });
    await prisma.elimination_games_predictions.deleteMany({ where: { prediction_id: predictionId } });
    await prisma.group_rankings_predictions.deleteMany({where : {prediction_id: predictionId}})
    
    // Create group game predictions
    const groupCreateData = GroupPredictions.flatMap((group) =>
      group.games.map((game) => ({
        prediction_id: predictionId,
        game_id: game.id,
        predicted_result: game.predicted_result ?? null,
        points_awarded: game.points_awarded ?? null,
      }))
    );

    // Create group rankings predictions
    const groupRankingsCreateData = GroupPredictions.flatMap((group) =>
      group.rankings.map((ranking) => ({
        prediction_id: predictionId,
        group_id: group.groupId,
        team_id: ranking.team.id,
        points: ranking.points,
        rank: ranking.rank,
      }))
    );

    // Create elimination game predictions
    const eliminationCreateData: Prisma.elimination_games_predictionsCreateManyInput[] = [];

    for (const round of EliminationPredictions) {
      for (const game of round.games) {
        if (!Number.isInteger(game.id)) continue;
      
        const dbGame = await prisma.elimination_games.findUnique({
          where: { id: game.actual_game_id },
          select: { team1_id: true, team2_id: true, round_id: true },
        });
      
        if (!dbGame) continue;
      
        eliminationCreateData.push({
          prediction_id: predictionId,
          game_id: game.actual_game_id,
          predicted_winner_id: game.predicted_winner_id ?? null,
          points_awarded: game.points_awarded ?? null,
          round_id: round.roundId,
          team1_id: game.team1?.id ?? null,
          team2_id: game.team2?.id ?? null,
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      if (groupCreateData.length > 0) {
        await tx.group_games_predictions.createMany({ data: groupCreateData });
      }
    
      if (groupRankingsCreateData.length > 0) {
        await tx.group_rankings_predictions.createMany({ data: groupRankingsCreateData });
      }
    
      if (eliminationCreateData.length > 0) {
        await tx.elimination_games_predictions.createMany({ data: eliminationCreateData });
      }
    
      if (typedChampion?.id && Number.isInteger(typedChampion.id)) {
        await tx.predictions.update({
          where: { id: predictionId },
          data: {
            predicted_champion_id: typedChampion.id,
          },
        });
      }
    });


    return NextResponse.json({ success: true, predictionId });
  } catch (error) {
    console.error("[SAVE_PREDICTION_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: (error as Error).message }), {
    status: 500,
  });
  }
}
