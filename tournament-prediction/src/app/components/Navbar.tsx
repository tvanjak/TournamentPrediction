"use client";

import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import LoginButton from "./loginButton";
import Link from "next/link";

export default function Navbar() {
    return (
        <AppBar position="static">
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" component="div">
                    <Link
                        href="/"
                        style={{ color: "inherit", textDecoration: "none" }}
                    >
                        TournamentPrediction
                    </Link>
                </Typography>
                <Box
                    sx={{
                        width: "300px",
                        display: "flex",
                        justifyContent: "space-around",
                        //mr: 15,
                    }}
                >
                    <Button href="/" color="inherit">
                        Home
                    </Button>
                    <Button href="/" color="inherit">
                        My groups
                    </Button>
                </Box>
                <LoginButton />
            </Toolbar>
        </AppBar>
    );
}
