"use client";

import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import LoginButton from "./LoginButton";
import Link from "next/link";
import theme from "../../styles/theme";

export default function Navbar() {
    return (
        <AppBar
            position="static"
            sx={{ backgroundColor: theme.palette.primary.main }}
        >
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
                <Box
                    sx={{
                        width: "200px",
                        display: "flex",
                        justifyContent: "end",
                    }}
                >
                    <LoginButton />
                </Box>
            </Toolbar>
        </AppBar>
    );
}
