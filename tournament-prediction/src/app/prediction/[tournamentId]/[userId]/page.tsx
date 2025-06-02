"use client";
import PredictionPage from "@/app/pages/PredictionPage";
import { useParams } from "next/navigation";

const prediction = () => {
    const params = useParams();
    const tournamentId = Number(params.tournamentId);
    const userId = Number(params.userId);
    return <PredictionPage tournamentId={tournamentId} userId={userId} />;
};

export default prediction;
