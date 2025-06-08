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
              status: game.result ? StatusEnum.Finished : StatusEnum.Pending,
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
              status: game.winner_id ? StatusEnum.Finished : StatusEnum.Pending,
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

      // Update champion if provided
      if (typedChampion?.id && Number.isInteger(typedChampion.id)) {
        await tx.tournaments.update({
          where: { id: parsedTournamentId },
          data: {
            champion_id: typedChampion.id,
            modified_at: new Date(),
          },
        });
      }


      // UPDATE LEADERBOARDS
      const actualGroupMap = new Map<number, ResultEnum>();
      for (const g of GroupGamesData) {
        for (const game of g.games) {
          if (game.result != null) actualGroupMap.set(game.id, game.result);
        }
      }

      // Build map: roundId → Set of actual teams in that round
      const eliminationTeamMap = new Map<number, Set<number>>();
      for (const round of EliminationGamesData) {
        const set = new Set<number>();
        for (const g of round.games) {
          if (g.team1?.id) set.add(g.team1.id);
          if (g.team2?.id) set.add(g.team2.id);
        }
        eliminationTeamMap.set(round.roundId, set);
      }

      // Fetch all predictions for tournament
      const predictions = await tx.predictions.findMany({
        where: { tournament_id: parsedTournamentId },
        select: {
          id: true,
          user_id: true,
          predicted_champion_id: true,
          group_games_predictions: { select: { id: true, game_id: true, predicted_result: true, points_awarded: true } },
          elimination_games_predictions: { select: { id: true, game_id: true, round_id: true, team1_id: true, team2_id: true, points_awarded: true } },
        },
      });

      // Process each user’s predictions
      for (const pred of predictions) {
        let totalPoints = 0;

        // Group phase scoring
        for (const g of pred.group_games_predictions) {
          const actual = actualGroupMap.get(g.game_id);
          const correct = actual != null && actual === g.predicted_result;
          const points = correct ? 3 : 0;
          totalPoints += points;
          await tx.group_games_predictions.update({ where: { id: g.id }, data: { points_awarded: actual == null ? null : points } });
        }

        // Elimination phase scoring
        for (const eg of pred.elimination_games_predictions) {
          const teams = eliminationTeamMap.get(eg.round_id);
          if (!teams) continue;

            // Check if the actual game has been played (by looking up the real game)
            const realGame = await tx.elimination_games.findUnique({
              where: { id: eg.game_id },
              select: { team1_id: true, team2_id: true },
            });

            // Skip updating points if both teams haven't been confirmed
            if (!realGame?.team1_id && !realGame?.team2_id) continue;

          let count = 0;
          if (eg.team1_id && teams.has(eg.team1_id)) count++;
          if (eg.team2_id && teams.has(eg.team2_id)) count++;
          const round = await tx.rounds.findUnique({ where: { id: eg.round_id }, select: { teamguessed_points: true } });
          const points = Math.min(count, 2) * (round?.teamguessed_points ?? 0);
          totalPoints += points;
          await tx.elimination_games_predictions.update({ where: { id: eg.id }, data: { points_awarded: points } }); //NEED MODIFICATION HERE
        }


        // Champion_points update on prediction
        let championPoints = null;
        if (typedChampion && pred.predicted_champion_id === typedChampion.id) {
          championPoints = 30;
          totalPoints += 30;
        } else if (typedChampion && pred.predicted_champion_id != typedChampion.id) {
          championPoints = 0
        }
        if (championPoints != null) {
          await tx.predictions.update({
            where: { id: pred.id },
            data: { champion_points: championPoints },
          });
        }

        // Tourney leaderboard
        await tx.tournament_leaderboards.upsert({
          where: { tournament_id_user_id: { tournament_id: parsedTournamentId, user_id: pred.user_id } },
          update: { total_points: totalPoints, modified_at: new Date() },
          create: { tournament_id: parsedTournamentId, user_id: pred.user_id, total_points: totalPoints },
        });

        // All-time leaderboard
        // Get all tournament leaderboard entries for this user
        const userTournamentEntries = await tx.tournament_leaderboards.findMany({
          where: { user_id: pred.user_id },
          select: { total_points: true },
        });

        const totalPointsSum = userTournamentEntries.reduce((sum, entry) => sum + (entry.total_points ?? 0), 0);
        const tournamentsPlayed = userTournamentEntries.length;
        const averagePoints = tournamentsPlayed > 0 ? totalPointsSum / tournamentsPlayed : 0;

        // Upsert all-time leaderboard based on real totals
        await tx.all_time_leaderboard.upsert({
          where: { user_id: pred.user_id },
          update: {
            total_points: totalPointsSum,
            tournaments_played: tournamentsPlayed,
            average_points: averagePoints,
            modified_at: new Date(),
          },
          create: {
            user_id: pred.user_id,
            total_points: totalPointsSum,
            tournaments_played: tournamentsPlayed,
            average_points: averagePoints,
          },
        });


        // Recompute average_points
        const allTime = await tx.all_time_leaderboard.findUnique({
          where: { user_id: pred.user_id },
          select: { total_points: true, tournaments_played: true },
        });

        if (allTime && allTime.tournaments_played > 0) {
          const newAverage = allTime.total_points / allTime.tournaments_played;
        
          await tx.all_time_leaderboard.update({
            where: { user_id: pred.user_id },
            data: {
              average_points: newAverage,
              modified_at: new Date(),
            },
          });
        }
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
