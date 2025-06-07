import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"

export async function GET(req: Request, context: {params: {id: string}}) {
    const predictionId = context.params.id;
    const parsedPredictionId = Number(predictionId)

    if (isNaN(parsedPredictionId)) {
        return new NextResponse("Invalid tournament ID", {status: 400});
    }

    try {
        const prediction = await prisma.predictions.findFirst({
            where: {
              id: parsedPredictionId,
            },
            include: {
              teams: {
                include: {
                  countries: { select: { name: true } },
                },
              },
            },
        });

        if (!prediction || !prediction.id) {
          return NextResponse.json({
            id: null,
            name: null,
          });
        }

        return NextResponse.json({
          id: prediction.teams?.id,
          countries: prediction.teams?.countries,
        });
    } catch (error) {
      console.error("[CHAMPION_FETCH_ERROR]", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
}