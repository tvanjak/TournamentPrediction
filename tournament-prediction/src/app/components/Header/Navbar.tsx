"use client";

import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import LoginButton from "./LoginButton";
import Link from "next/link";
import theme from "../../styles/theme";
import { useSession } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();
    return (
        <AppBar
            position="static"
            sx={{ backgroundColor: theme.palette.primary.main }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box width={"300px"}>
                    <Typography variant="h6" component="div">
                        <Link
                            href="/"
                            style={{ color: "inherit", textDecoration: "none" }}
                        >
                            TournamentMania
                        </Link>
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: "300px",
                        display: "flex",
                        justifyContent: "space-around",
                    }}
                >
                    <Button href="/" color="inherit">
                        Home
                    </Button>
                    {session?.user.email && (
                        <Button href="/groups" color="inherit">
                            My groups
                        </Button>
                    )}
                </Box>
                <Box
                    sx={{
                        width: "300px",
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
