import { Box, List, ListItem, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import theme from "../styles/theme";
import InfoBox from "./General/GroupBox";

type Props = {};

const OngoingTournaments = (props: Props) => {
    const [tournaments, setTournaments] = useState<string[]>([]);

    useEffect(() => {
        setTournaments(["FIFA World Cup 2026", "Rugby World Cup"]);
    }, []);
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 400,
            }}
        >
            <InfoBox>Ongoing tournaments</InfoBox>
            <List>
                {tournaments.map((tournament, index) => (
                    <ListItem key={index}>
                        <Typography> • {tournament}</Typography>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default OngoingTournaments;
