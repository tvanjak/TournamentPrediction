import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client"

export async function GET(req: Request, {params} : {params : {id: string}}) {
    const tournamentId = Number(params.id);

    if (isNaN(tournamentId)) {
        return new NextResponse("Invalid tournament ID", {status: 400});
    }

    try {
        const matchups = await prisma.elimination_matchups.findMany({
            where: {
                tournament_id: tournamentId
            }, 
            select: {
                round_id: true,
                team1: true,
                team2: true,
                rounds: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        return NextResponse.json(matchups)
    } catch(error) {
        console.error("[TOURNAMENT_MATCHUPS_ERROR", error);
        return new NextResponse("Internal Server Error", {status: 500});
    }
}