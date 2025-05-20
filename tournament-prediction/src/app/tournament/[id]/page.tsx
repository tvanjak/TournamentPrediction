"use client";
import TournamentPage from "../../pages/TournamentPage";
import { useParams } from "next/navigation";

type Props = {};

const tournament = (props: Props) => {
    const params = useParams();
    const id = Number(params.id);
    return <TournamentPage tournamentId={id} />;
};

export default tournament;
