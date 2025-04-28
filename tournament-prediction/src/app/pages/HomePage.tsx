"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Container } from "@mui/material";
import AllTimeLeaderboard from "../components/Leaderboards/AllTimeLeaderboard";
import OngoingTournaments from "../components/OngoingTournaments";

type Props = {};

const HomePage = (props: Props) => {
    const { data: session } = useSession();
    return (
        <Container
            maxWidth="lg"
            sx={{
                mt: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <AllTimeLeaderboard></AllTimeLeaderboard>
            <OngoingTournaments></OngoingTournaments>
        </Container>
    );
};

export default HomePage;
