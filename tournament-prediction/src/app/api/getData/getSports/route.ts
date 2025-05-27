import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"

export async function GET(req: Request) {
    try {
        const sports = await prisma.sports.findMany({
            select: {
                id: true,
                name: true,
            }
        })

        return NextResponse.json({sports})
    } catch(error) {
        console.error("[SPORTS_FETCH_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}