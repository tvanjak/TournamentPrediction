"use client";
import PredictionPage from "@/app/pages/PredictionPage";
import { useParams } from "next/navigation";

type Props = {};

const prediction = (props: Props) => {
    const params = useParams();
    const id = Number(params.id);
    return <PredictionPage tournamentId={id} />;
};

export default prediction;
