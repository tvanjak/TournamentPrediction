import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"

export async function GET(req: Request) {
    try {
        const countries = await prisma.countries.findMany({
            
        })

        return NextResponse.json({
            countries
        })
    } catch(error) {
        console.error("[COUNTRIES_FETCH_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}