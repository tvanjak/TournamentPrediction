import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"

export async function GET(req: Request, {params}: {params: {id: string}}) {
    const tournamentId = Number(params.id);

    if (isNaN(tournamentId)) {
        return new NextResponse("Invalid tournament ID", {status: 400});
    }

    try {
      const champion = await prisma.tournaments.findFirst({
        where: {
          id: tournamentId
        },
        include: {
          teams: {
            include: {
              countries: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })

      return NextResponse.json({
        id: champion?.champion_id,
        countries: champion?.teams?.countries
      })
    } catch (error) {
      console.error("[CHAMPION_FETCH_ERROR]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
}