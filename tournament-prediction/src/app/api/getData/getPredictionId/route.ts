import { NextResponse } from "next/server";
import prisma from "@/lib/prisma-client"
import { status_enum } from "@/types/enums";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {userId, tournamentId} = body;
        const parsedUserId = Number(userId);
        const parsedTournamentId = Number(tournamentId);
        console.log("USER BACKEND: ",userId)
        console.log("TOUR BACKEND: ", tournamentId)
        
        if (!userId || !tournamentId) {
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
            let groupGames = await prisma.group_games.findMany({
                where : {
                    tournament_id: parsedTournamentId
                }
            }) 
            //let eliminationGames = await prisma.elimination_games.findMany({
            //    where : {
            //        tournament_id: tournament_id
            //    },
            //})

            prediction = await prisma.predictions.create({
                data: {tournament_id: parsedTournamentId, user_id: parsedUserId}
            });
            
            const groupCreateData = groupGames.map((gg) => ({
                prediction_id: prediction!.id,
                game_id: gg.id,
            }))
            //const eliminationCreateData = eliminationGames.map((eg) => ({
            //    prediction_id: prediction.id,
            //    game_id: eg.id,
            //    round_id: eg.round_id,
            //}))
            
            console.log("IN BACKEND: ", groupCreateData)
            //await prisma.group_games_predictions.createMany({data :  groupCreateData})
            //await prisma.elimination_games_predictions.createMany({data :  eliminationCreateData})
        }

        const predictionId = prediction.id;

        return NextResponse.json({success: true, predictionId});
    } catch(error) {     
    console.error("[GET_PREDICTION_ID_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}