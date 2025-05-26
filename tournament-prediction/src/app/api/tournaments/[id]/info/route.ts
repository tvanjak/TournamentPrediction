import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"

export async function GET(req: Request, {params} : {params: {id:string}}) {
    const tournamentId = Number(params.id);

    if (isNaN(tournamentId)) {
        return new NextResponse("Invalid tournament ID", { status: 400 });
      }
    
      try {
        const tournamentInfo = await prisma.tournaments.findUnique({
            where : {
                id: tournamentId
            },
            select : {
                status: true,
                name: true,
            },
        });

        return NextResponse.json(tournamentInfo);
      } catch(error) {
        console.error("[TOURNMENT_INFO_ERROR", error);
        return new NextResponse("Internal Server Error", {status: 500});
      }
}

