import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";
import { StatusEnum, TournamentStatusEnum } from "@/types/enums";

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      selectedSport,
      groups,
      groupGames,
      groupRankings,
      eliminationMatchups,
    } = await req.json();

    const tournamentCreate = prisma.tournaments.create({
      data: {
        name,
        sport_id: selectedSport.id,
        status: TournamentStatusEnum.Upcoming,
      },
    });

    const tournament = await prisma.$transaction([tournamentCreate]);
    const tournamentId = tournament[0].id;

    const groupCreateOps = groups.map((groupName: string) =>
      prisma.groups.create({
        data: {
          name: groupName,
          tournament_id: tournamentId,
        },
      })
    );

    const createdGroups = await prisma.$transaction(groupCreateOps);
    const groupNameToIdMap: Record<string, number> = {};
    createdGroups.forEach((group) => {
      groupNameToIdMap[group.name] = group.id;
    });

    const groupGamesData = groupGames.map((game: any) => ({
      tournament_id: tournamentId,
      group_id: groupNameToIdMap[game.group_name],
      team1_id: game.team1.id,
      team2_id: game.team2.id,
      status: StatusEnum.Pending,
    }));

    const groupRankingsData = groupRankings.map((ranking: any) => ({
      tournament_id: tournamentId,
      group_id: groupNameToIdMap[ranking.group_name],
      team_id: ranking.team.id,
      points: 0,
      rank: 0,
    }));

    const eliminationMatchupsData = eliminationMatchups.map((matchup: any) => ({
      tournament_id: tournamentId,
      team1: matchup.team1,
      team2: matchup.team2,
      round_id: matchup.round_id,
    }));

    try {
      await prisma.$transaction([
        prisma.group_games.createMany({ data: groupGamesData }),
        prisma.group_rankings.createMany({ data: groupRankingsData }),
        prisma.elimination_matchups.createMany({ data: eliminationMatchupsData }),
      ]);
    } catch (error: any) {
      console.error("Error in tournament creation:", error.message, error);
      return NextResponse.json(
        { error: error.message || "Server error" },
        { status: 500 }
      );
    }


    return NextResponse.json({ message: "Tournament created successfully" });
  } catch (error) {
    console.error("[TOURNAMENT_CREATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create tournament" },
      { status: 500 }
    );
  }
}
