import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client"

export async function GET() {
    try {
        const rounds = await prisma.rounds.findMany({
            select: {
                id: true,
                name: true
            }
        })

        return NextResponse.json({rounds})
    } catch(error) {
        console.error("[ROUNDS_FETCH_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}