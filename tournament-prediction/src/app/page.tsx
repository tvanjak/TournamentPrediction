"use client";

import { useSession } from "next-auth/react";
import { Box, Container, Paper, Typography } from "@mui/material";

export default function Home() {
    const { data: session, status } = useSession();
    const loading = status === "loading";

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to Your App
                </Typography>

                {loading ? (
                    <Typography>Loading...</Typography>
                ) : session ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Hello, {session.user?.name}!
                        </Typography>
                        <Typography variant="body1">
                            You are signed in with {session.user?.email}
                        </Typography>
                    </Box>
                ) : (
                    <Typography>
                        Please sign in using the button in the navbar.
                    </Typography>
                )}
            </Paper>
        </Container>
    );
}
