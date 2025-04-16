"use client";

import { Avatar, Box, Container, Typography } from "@mui/material";
import React from "react";
import AllTimeLeaderboard from "../components/AllTimeLeaderboard";
import theme from "../styles/theme";
import { useSession } from "next-auth/react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

type Props = {};

const ProfilePage = (props: Props) => {
    const { data: session, status } = useSession();

    if (session)
        return (
            <Container
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mt: 4,
                }}
            >
                <Box
                    sx={{
                        width: 400,
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                    }}
                >
                    <Box sx={{ p: 2 }}>
                        {" "}
                        {session.user.image && (
                            <Avatar
                                alt="User Profile"
                                src={session.user.image}
                                sx={{ width: 80, height: 80 }}
                            />
                        )}
                        {!session.user.image && (
                            <AccountCircleIcon fontSize="large" />
                        )}
                    </Box>
                    <Box>
                        <Typography>• {session.user.name}</Typography>
                    </Box>
                </Box>
                <AllTimeLeaderboard></AllTimeLeaderboard>
            </Container>
        );
};

export default ProfilePage;
