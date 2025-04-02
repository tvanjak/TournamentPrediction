"use client";

import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import LoginButton from "./login-button";
import Link from "next/link";

export default function Navbar() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Link
                        href="/"
                        style={{ color: "inherit", textDecoration: "none" }}
                    >
                        TournamentPrediction
                    </Link>
                </Typography>
                <LoginButton />
            </Toolbar>
        </AppBar>
    );
}
