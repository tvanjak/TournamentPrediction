import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"
import { StatusEnum } from "@/types/enums";
import { Prisma, group_games, elimination_games, group_games_predictions, elimination_games_predictions } from "@prisma/client";

export async function POST(req: Request) {

    let groupGames: group_games[] = [];
    let eliminationGames: elimination_games[] = [];

    let groupCreateData: Prisma.group_games_predictionsCreateManyInput[] = [];
    let eliminationCreateData: Prisma.elimination_games_predictionsCreateManyInput[] = [];


    try {
        const body = await req.json();
        const {userId, tournamentId} = body;
        const parsedUserId = Number(userId);
        const parsedTournamentId = Number(tournamentId);
        
        if (isNaN(parsedUserId) || isNaN(parsedTournamentId)) {
            return NextResponse.json(
                { success: false, message: "Missing userId or tournamentId" },
                { status: 400 }
            );
        }

        let prediction = await prisma.predictions.findFirst({
            where: {
                tournament_id: parsedTournamentId, user_id: parsedUserId
            }
        });

        if (!prediction) {
            groupGames = await prisma.group_games.findMany({
                where : {
                    tournament_id: parsedTournamentId
                }
            }) 
            eliminationGames = await prisma.elimination_games.findMany({
                where : {
                    tournament_id: parsedTournamentId
                },
            })

            const prediction = await prisma.$transaction(async (tx) => {
                const prediction = await tx.predictions.create({
                  data: { tournament_id: parsedTournamentId, user_id: parsedUserId },
                });
            
                const groupCreateData = groupGames.map((gg) => ({
                  prediction_id: prediction.id,
                  game_id: gg.id,
                }));
                const eliminationCreateData = eliminationGames.map((eg) => ({
                  prediction_id: prediction.id,
                  game_id: eg.id,
                  round_id: eg.round_id,
                }));
            
                await tx.group_games_predictions.createMany({ data: groupCreateData });
                await tx.elimination_games_predictions.createMany({ data: eliminationCreateData });

                return prediction;
            });

            //await prisma.group_games_predictions.createMany({data :  groupCreateData})
            //await prisma.elimination_games_predictions.createMany({data :  eliminationCreateData})
        }

        if (!prediction) {
            return NextResponse.json(
                { success: false, message: "Prediction creation failed." },
                { status: 500 }
            );
        }
        const predictionId = prediction.id; //HERE I AM GETTING AN ERROR THAT PREDICTION might be null

        return NextResponse.json({success: true, predictionId, groupCreateData: groupGames, eliminationCreateData : eliminationGames});
    } catch(error) {     
    console.error("[GET_PREDICTION_ID_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}