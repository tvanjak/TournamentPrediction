import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  try {
    const ongoingTournaments = await prisma.tournaments.findMany({
      where: {
        status: "ONGOING",
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ tournaments: ongoingTournaments });
  } catch (error) {
    console.error("[GET_ONGOING_TOURNAMENTS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
