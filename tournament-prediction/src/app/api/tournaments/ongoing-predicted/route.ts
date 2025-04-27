// pages/api/tournaments/ongoing-with-prediction.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // adjust to where your auth config is
import prisma from "@/lib/prisma-client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const tournaments = await prisma.tournaments.findMany({
      where: {
        status: "ONGOING",
        predictions: {
          some: {
            user_id: session.user.id,
          },
        },
      },
      include: {
        predictions: {
          where: {
            user_id: session.user.id,
          },
        },
      },
    });

    res.status(200).json(tournaments);
  } catch (error) {
    console.error("Error fetching ongoing tournaments with predictions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
