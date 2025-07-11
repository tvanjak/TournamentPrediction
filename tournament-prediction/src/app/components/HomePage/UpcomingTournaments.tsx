import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import PrimaryBox from "../General/PrimaryBox";
import CustomTooltip from "../General/CustomTooltip";
import { useRouter } from "next/navigation";

interface Tournament {
    id: number;
    name: string;
}

type Props = {
    userId: number;
    onLoaded: () => void;
};

const UpcomingTournaments = (props: Props) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const handleClick = (tournamentId: number) => {
        if (props.userId != -1)
            router.push(`/prediction/${tournamentId}/${props.userId}`);
    };

    useEffect(() => {
        const getUpcomingTournaments = async () => {
            try {
                const res = await fetch(`/api/tournaments/upcoming`);
                if (!res.ok)
                    throw new Error("Failed to fetch tournament by ID");
                const data = await res.json();
                console.log(data);
                setTournaments(data.tournaments);
            } catch (error) {
                console.log("Error fetching upcoming tournaments: ", error);
            } finally {
                setLoading(false);
                props.onLoaded();
            }
        };
        getUpcomingTournaments();
    }, []);

    if (loading) return null;

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 350,
                p: 3,
            }}
        >
            <PrimaryBox>Upcoming tournaments:</PrimaryBox>
            {tournaments.length != 0 ? (
                <Box component="ul" sx={{ pl: 2 }}>
                    {tournaments.map((tournament, index) => (
                        <CustomTooltip key={index} title="Make prediction">
                            <Box
                                onClick={() => handleClick(tournament.id)}
                                component="li"
                                sx={{
                                    borderRadius: 4,
                                    textAlign: "left",
                                    padding: 2,
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#e0e0e0",
                                        cursor: "pointer",
                                    },
                                    fontSize: 18,
                                    listStyleType: "disc",
                                }}
                            >
                                {tournament.name}
                            </Box>
                        </CustomTooltip>
                    ))}
                </Box>
            ) : (
                <Box padding={2}>No upcoming tournaments at the moment.</Box>
            )}
        </Box>
    );
};

export default UpcomingTournaments;
