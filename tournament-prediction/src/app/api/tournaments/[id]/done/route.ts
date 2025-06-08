import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"
import { TournamentStatusEnum } from "@/types/enums";

export async function GET(req: Request, {params}: {params: {id: string}}) {
    const tournamentId = Number(params.id);

    if (isNaN(tournamentId)) {
        return new NextResponse("Invalid tournament ID", {status: 400});
    }

    try {
        await prisma.tournaments.update({
            where: { id: tournamentId },
            data: {
                status: TournamentStatusEnum.Completed,
                modified_at: new Date(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
      console.error("[TOURNAMENT_DONE_ERROR]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
}