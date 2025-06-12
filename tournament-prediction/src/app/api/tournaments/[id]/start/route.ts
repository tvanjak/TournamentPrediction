import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { TournamentStatusEnum } from "@/types/enums";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const tournamentId = Number(params.id);

    if (!tournamentId ) {
      return new NextResponse("Invalid tournamentId", { status: 400 });
    }

    try {
        await prisma.tournaments.update({
            where: {
                id: tournamentId,
            },
            data: {
                status: TournamentStatusEnum.Ongoing
            }
        })

        return new NextResponse("Tournament status updated to ONGOING", { status: 200 });
    } catch(error) {
        console.error("[START_TOURNAMENT_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        });
    }
}