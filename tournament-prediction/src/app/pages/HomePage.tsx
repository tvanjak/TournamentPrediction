"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Box, Container } from "@mui/material";
import AllTimeLeaderboard from "../components/Leaderboards/AllTimeLeaderboard";
import OngoingTournaments from "../components/HomePage/OngoingTournaments";
import UpcomingTournaments from "../components/HomePage/UpcomingTournaments";

type Props = {};

const HomePage = (props: Props) => {
    const { data: session } = useSession();
    return (
        <Container
            maxWidth="lg"
            sx={{
                mt: 1,
                display: "flex",
                alignItems: "top",
                justifyContent: "center",
            }}
        >
            <AllTimeLeaderboard></AllTimeLeaderboard>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                }}
            >
                <OngoingTournaments></OngoingTournaments>
                <UpcomingTournaments></UpcomingTournaments>
            </Box>
        </Container>
    );
};

export default HomePage;
