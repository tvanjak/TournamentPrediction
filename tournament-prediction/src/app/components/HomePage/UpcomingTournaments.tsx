import { Box, List, ListItem, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import theme from "../../styles/theme";
import PrimaryBox from "../General/PrimaryBox";

interface Tournament {
    id: number;
    name: string;
}

type Props = {};

const UpcomingTournaments = (props: Props) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);

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
            }
        };
        getUpcomingTournaments();
    }, []);

    //if (loading) return <Loading />;

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 400,
                p: 3,
            }}
        >
            <PrimaryBox>Upcoming tournaments:</PrimaryBox>
            {tournaments.length != 0 ? (
                <List>
                    {tournaments.map((tournament, index) => (
                        <ListItem key={index}>
                            <Box
                                sx={{
                                    borderRadius: 5,
                                    textAlign: "center",
                                    padding: 1.5,
                                    //color: theme.palette.textBlack.main,
                                    //fontWeight: "600",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": {
                                        backgroundColor: "#e0e0e0",
                                    },
                                }}
                            >
                                <Typography fontSize={18}>
                                    • {tournament.name}
                                </Typography>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Box>No upcoming tournaments at the moment.</Box>
            )}
        </Box>
    );
};

export default UpcomingTournaments;
