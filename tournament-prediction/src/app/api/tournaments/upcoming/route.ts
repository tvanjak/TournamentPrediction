import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const tournaments = await prisma.tournaments.findMany({
      where: {
        status: "UPCOMING",
      },
      orderBy: {
        year: "asc", // or created_at
      },
    });

    res.status(200).json(tournaments);
  } catch (error) {
    console.error("Error fetching upcoming tournaments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
