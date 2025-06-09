import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const tournamentId = Number(params.id);

  if (isNaN(tournamentId)) {
    return new NextResponse("Invalid tournament ID", { status: 400 });
  }

  try {
    const eliminationGames = await prisma.elimination_games.findMany({
      where: {
        tournament_id: tournamentId,
      },
      include: {
        rounds: true,
        team1: {
          include: {
            countries: {
              select: { name: true },
            },
          },
        },
        team2: {
          include: {
            countries: {
              select: { name: true },
            },
          },
        },
        team_winner: {
          include: {
            countries: {
              select: { name: true },
            },
          },
        },
      },
    });

    const groupedByRound = eliminationGames.reduce((acc, game) => {
      const roundName = game.rounds?.name ?? "Unknown";

      if (!acc[roundName]) acc[roundName] = [];

      acc[roundName].push({
        id: game.id,
        team1: game.team1,
        team2: game.team2,
        rounds: game.rounds,
        winner_id: game.winner_id ?? null,
        status: game.status,
      });

      return acc;
    }, {} as Record<string, any[]>);

    const result = Object.entries(groupedByRound).map(([roundName, games]) => ({
      roundName,
      roundId: games[0]?.rounds?.id ?? null,
      games,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ELIMINATION_GAMES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
