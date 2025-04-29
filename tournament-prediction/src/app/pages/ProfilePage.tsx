"use client";

import { Avatar, Box, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import theme from "../styles/theme";
import { useSession } from "next-auth/react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import GroupLeaderboard from "../components/Leaderboards/AllTimeGroupsLeaderboard";
import Loading from "../components/General/Loading";
import TournamentLeaderboard from "../components/Leaderboards/TournamentLeaderboard";
import TournamentGroupLeaderboard from "../components/Leaderboards/TournamentGroupsLeaderboards";

type Props = {};

const ProfilePage = (props: Props) => {
    const { data: session, status } = useSession();
    const [totalPoints, setTotalPoints] = useState<number>();
    const [averagePoints, setAveragePoints] = useState<number>();
    const [groupIds, setGroupIds] = useState<number[]>();
    const [userId, setUserId] = useState<number>();

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await fetch(
                    `/api/users/getIdByEmail?email=${session?.user.email}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch user ID");
                }
                const data = await response.json();
                setUserId(data.userId);
            } catch (error) {
                console.error("Error fetching user ID: ", error);
            }
        };
        if (session?.user.email) fetchUserId();
    }, [session?.user.email]);

    useEffect(() => {
        const fetchTotalPoints = async () => {
            try {
                const response = await fetch(
                    `/api/users/${userId}/totalPoints`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch total points");
                }
                const data = await response.json();
                setTotalPoints(data.totalPoints);
            } catch (error) {
                console.error("Error fetching total points: ", error);
            }
        };
        const fetchAveragePoints = async () => {
            try {
                const response = await fetch(
                    `/api/users/${userId}/averagePoints`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch average points");
                }
                const data = await response.json();
                setAveragePoints(data.averagePoints);
            } catch (error) {
                console.error("Error fetching average points: ", error);
            }
        };
        const fetchGroupIds = async () => {
            try {
                const response = await fetch(`/api/users/${userId}/groupIds`);
                if (!response.ok) {
                    throw new Error("Failed to fetch group IDs");
                }
                const data = await response.json();
                setGroupIds(data.groupIds);
            } catch (error) {
                console.log("Error fetching group IDs: ", error);
            }
        };
        if (userId) {
            console.log("User ID: ", userId);
            fetchTotalPoints();
            fetchAveragePoints();
            fetchGroupIds();
        }
    }, [userId]);

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
                                sx={{ width: 50, height: 50 }}
                            />
                        )}
                        {!session.user.image && (
                            <AccountCircleIcon fontSize="large" />
                        )}
                    </Box>
                    <Box>
                        <Typography>• Username: {session.user.name}</Typography>
                        <Typography>• Total points: {totalPoints}</Typography>
                        <Typography>
                            • Average points: {averagePoints}
                        </Typography>
                    </Box>
                </Box>
                {groupIds ? (
                    <GroupLeaderboard groupIds={groupIds}></GroupLeaderboard>
                ) : (
                    <Loading></Loading>
                )}
                <TournamentGroupLeaderboard
                    tournamentId={1}
                    groupId={1}
                ></TournamentGroupLeaderboard>
            </Container>
        );
};

export default ProfilePage;
