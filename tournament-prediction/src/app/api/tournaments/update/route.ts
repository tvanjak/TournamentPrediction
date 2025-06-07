import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { StatusEnum, ResultEnum } from "@/types/enums";

import { Team, TournamentGroupGamesType, TournamentEliminationGamesType } from "@/types/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tournamentId, groupGames, eliminationGames, champion } = body;

    const GroupGamesData = groupGames as TournamentGroupGamesType[];
    const EliminationGamesData = eliminationGames as TournamentEliminationGamesType[];
    const typedChampion = champion as Team | null | undefined;

    if (isNaN(tournamentId)) {
      return new NextResponse("Missing tournamentId", { status: 400 });
    }

    const parsedTournamentId = Number(tournamentId);

    await prisma.$transaction(async (tx) => {
      // Upsert group games
      for (const group of GroupGamesData) {
        for (const game of group.games) {
          await tx.group_games.upsert({
            where: { id: game.id },
            update: {
              status: game.status,
              result: game.result ?? null,
              modified_at: new Date(),
            },
            create: {
              id: game.id,
              tournament_id: parsedTournamentId,
              group_id: group.groupId,
              team1_id: game.team1?.id ?? 0,
              team2_id: game.team2?.id ?? 0,
              status: game.status,
              result: game.result ?? null,
            },
          });
        }

        // Upsert group rankings
        for (const ranking of group.rankings) {
          await tx.group_rankings.upsert({
            where: {
              tournament_id_group_id_team_id: {
                tournament_id: parsedTournamentId,
                group_id: group.groupId,
                team_id: ranking.team.id,
              },
            },
            update: {
              points: ranking.points,
              rank: ranking.rank,
              modified_at: new Date(),
            },
            create: {
              tournament_id: parsedTournamentId,
              group_id: group.groupId,
              team_id: ranking.team.id,
              points: ranking.points,
              rank: ranking.rank,
            },
          });
        }
      }

      // Upsert elimination games
      for (const round of EliminationGamesData) {
        for (const game of round.games) {
          await tx.elimination_games.upsert({
            where: { id: game.id },
            update: {
              round_id: round.roundId,
              team1_id: game.team1?.id ?? null,
              team2_id: game.team2?.id ?? null,
              winner_id: game.winner_id ?? null,
              status: game.status,
              modified_at: new Date(),
            },
            create: {
              id: game.id,
              tournament_id: parsedTournamentId,
              round_id: round.roundId,
              team1_id: game.team1?.id ?? null,
              team2_id: game.team2?.id ?? null,
              winner_id: game.winner_id ?? null,
              status: game.status,
            },
          });
        }
      }

      // Update predicted champion if provided
      if (typedChampion?.id && Number.isInteger(typedChampion.id)) {
        await tx.tournaments.update({
          where: { id: parsedTournamentId },
          data: {
            champion_id: typedChampion.id,
            modified_at: new Date(),
          },
        });
      }
    });

    return NextResponse.json({ success: true, parsedTournamentId });
  } catch (error) {
    console.error("[SAVE_TOURNAMENT_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }
}
