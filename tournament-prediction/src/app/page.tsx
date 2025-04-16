"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Box, Container, Paper, Typography, Button } from "@mui/material";
import AuthDebug from "@/app/components/auth-debug";
import AllTimeLeaderboard from "./components/AllTimeLeaderboard";

export default function Home() {
    const { data: session, status } = useSession();
    const loading = status === "loading";

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <AllTimeLeaderboard></AllTimeLeaderboard>
        </Container>
    );
}
