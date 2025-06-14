export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
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

    // ---------------- PHASE 1: Save Games, Rankings, Champion ----------------
    await prisma.$transaction(async (tx) => {
      for (const group of GroupGamesData) {
        for (const game of group.games) {
          const existingGame = await tx.group_games.findUnique({ where: { id: game.id } });

          if (existingGame) {
            await tx.group_games.update({
              where: { id: game.id },
              data: {
                status: game.result ? StatusEnum.Finished : StatusEnum.Pending,
                result: game.result ?? null,
                modified_at: new Date(),
              },
            });
          } else {
            await tx.group_games.create({
              data: {
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
        }

        for (const ranking of group.rankings) {
          const existingRanking = await tx.group_rankings.findUnique({
            where: {
              tournament_id_group_id_team_id: {
                tournament_id: parsedTournamentId,
                group_id: group.groupId,
                team_id: ranking.team.id,
              },
            },
          });

          if (existingRanking) {
            await tx.group_rankings.update({
              where: { id: existingRanking.id },
              data: {
                points: ranking.points,
                rank: ranking.rank,
                modified_at: new Date(),
              },
            });
          } else {
            await tx.group_rankings.create({
              data: {
                tournament_id: parsedTournamentId,
                group_id: group.groupId,
                team_id: ranking.team.id,
                points: ranking.points,
                rank: ranking.rank,
              },
            });
          }
        }
      }

      for (const round of EliminationGamesData) {
        for (const game of round.games) {
          const existingGame = await tx.elimination_games.findUnique({ where: { id: game.id } });

          if (existingGame) {
            await tx.elimination_games.update({
              where: { id: game.id },
              data: {
                round_id: round.roundId,
                team1_id: game.team1?.id ?? null,
                team2_id: game.team2?.id ?? null,
                winner_id: game.winner_id ?? null,
                status: game.winner_id ? StatusEnum.Finished : StatusEnum.Pending,
                modified_at: new Date(),
              },
            });
          } else {
            await tx.elimination_games.create({
              data: {
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
      }

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

    // ---------------- PHASE 2: Prepare actual maps and read predictions ----------------
    const actualGroupMap = new Map<number, ResultEnum>();
    for (const g of GroupGamesData) {
      for (const game of g.games) {
        if (game.result != null) actualGroupMap.set(game.id, game.result);
      }
    }

    const eliminationTeamMap = new Map<number, Set<number>>();
    for (const round of EliminationGamesData) {
      const set = new Set<number>();
      for (const g of round.games) {
        if (g.team1?.id) set.add(g.team1.id);
        if (g.team2?.id) set.add(g.team2.id);
      }
      eliminationTeamMap.set(round.roundId, set);
    }

    const predictions = await prisma.predictions.findMany({
      where: { tournament_id: parsedTournamentId },
      select: {
        id: true,
        user_id: true,
        predicted_champion_id: true,
        group_games_predictions: true,
        elimination_games_predictions: true,
      },
    });

    // ---------------- PHASE 3: Process predictions, update points and leaderboards ----------------
    for (const pred of predictions) {
      await prisma.$transaction(async (tx) => {
        let totalPoints = 0;

        for (const g of pred.group_games_predictions) {
          const actual = actualGroupMap.get(g.game_id);
          const correct = actual != null && actual === g.predicted_result;
          const points = correct ? 3 : 0;
          totalPoints += points;
          await tx.group_games_predictions.update({ where: { id: g.id }, data: { points_awarded: actual == null ? null : points } });
        }

        for (const eg of pred.elimination_games_predictions) {
          const teams = eliminationTeamMap.get(eg.round_id);
          if (!teams) continue;

          const realGame = await tx.elimination_games.findUnique({ where: { id: eg.game_id }, select: { team1_id: true, team2_id: true } });
          if (!realGame?.team1_id && !realGame?.team2_id) continue;

          let count = 0;
          if (eg.team1_id && teams.has(eg.team1_id)) count++;
          if (eg.team2_id && teams.has(eg.team2_id)) count++;

          const round = await tx.rounds.findUnique({ where: { id: eg.round_id }, select: { teamguessed_points: true } });
          const points = Math.min(count, 2) * (round?.teamguessed_points ?? 0);
          totalPoints += points;
          await tx.elimination_games_predictions.update({ where: { id: eg.id }, data: { points_awarded: points } });
        }

        let championPoints = null;
        if (typedChampion && pred.predicted_champion_id === typedChampion.id) {
          championPoints = 30;
          totalPoints += 30;
        } else if (typedChampion) {
          championPoints = 0;
        }

        if (championPoints != null) {
          await tx.predictions.update({ where: { id: pred.id }, data: { champion_points: championPoints } });
        }

        const existingEntry = await tx.tournament_leaderboards.findUnique({
          where: { tournament_id_user_id: { tournament_id: parsedTournamentId, user_id: pred.user_id } },
        });

        if (existingEntry) {
          await tx.tournament_leaderboards.update({
            where: { id: existingEntry.id },
            data: { total_points: totalPoints, modified_at: new Date() },
          });
        } else {
          await tx.tournament_leaderboards.create({
            data: { tournament_id: parsedTournamentId, user_id: pred.user_id, total_points: totalPoints },
          });
        }

        const userTournamentEntries = await tx.tournament_leaderboards.findMany({
          where: { user_id: pred.user_id },
          select: { total_points: true },
        });

        const totalPointsSum = userTournamentEntries.reduce((sum, entry) => sum + (entry.total_points ?? 0), 0);
        const tournamentsPlayed = userTournamentEntries.length;
        const averagePoints = tournamentsPlayed > 0 ? totalPointsSum / tournamentsPlayed : 0;

        const existingAllTime = await tx.all_time_leaderboard.findUnique({ where: { user_id: pred.user_id } });

        if (existingAllTime) {
          await tx.all_time_leaderboard.update({
            where: { user_id: pred.user_id },
            data: {
              total_points: totalPointsSum,
              tournaments_played: tournamentsPlayed,
              average_points: averagePoints,
              modified_at: new Date(),
            },
          });
        } else {
          await tx.all_time_leaderboard.create({
            data: {
              user_id: pred.user_id,
              total_points: totalPointsSum,
              tournaments_played: tournamentsPlayed,
              average_points: averagePoints,
            },
          });
        }
      });
    }

    return NextResponse.json({ success: true, parsedTournamentId });
  } catch (error) {
    console.error("[SAVE_TOURNAMENT_ERROR]", error);
    return new NextResponse(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }
}
