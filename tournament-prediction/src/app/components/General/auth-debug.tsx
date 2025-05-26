"use client";

import { useSession } from "next-auth/react";
import { Box, Typography, Paper } from "@mui/material";

export default function AuthDebug() {
    const { data: session, status } = useSession();

    return (
        <Paper elevation={3} sx={{ p: 2, mt: 2, bgcolor: "grey.100" }}>
            <Typography variant="h6">Authentication Debug</Typography>
            <Typography>Status: {status}</Typography>

            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">Session Data:</Typography>
                <pre style={{ overflow: "auto", maxHeight: "200px" }}>
                    {JSON.stringify(session, null, 2)}
                </pre>
            </Box>
        </Paper>
    );
}
