"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Box, Container, Paper, Typography, Button } from "@mui/material";
import AuthDebug from "@/app/components/auth-debug";

export default function Home() {
    const { data: session, status } = useSession();
    const loading = status === "loading";

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Authentication Test
                </Typography>

                {loading ? (
                    <Typography>Loading...</Typography>
                ) : session ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Hello, {session.user?.name || session.user?.email}!
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            You are signed in with {session.user?.email}
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => signOut()}
                            sx={{ mt: 2 }}
                        >
                            Sign Out
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="body1" gutterBottom>
                            You are not signed in.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => signIn("google")}
                            sx={{ mt: 2 }}
                        >
                            Sign In with Google
                        </Button>
                    </Box>
                )}
            </Paper>

            <AuthDebug />
        </Container>
    );
}
