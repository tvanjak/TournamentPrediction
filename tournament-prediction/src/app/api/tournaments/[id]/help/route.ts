import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const tournamentId = Number(params.id);

  if (!tournamentId ) {
    return new NextResponse("Invalid tournamentId", { status: 400 });
  }

  try {
    const games = await prisma.elimination_games.findMany({
      where: { tournament_id: Number(tournamentId) },
      select: { id: true, round_id: true },
      orderBy: [{ round_id: "desc" }],
    });

    const gameIds = games.map((g) => g.id);
    return NextResponse.json(gameIds);
  } catch (error) {
    console.error("[FETCH_ELIMINATION_GAMES_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
