"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Box, Button, Container } from "@mui/material";
import AllTimeLeaderboard from "../components/Leaderboards/AllTimeLeaderboard";
import OngoingTournaments from "../components/HomePage/OngoingTournaments";
import UpcomingTournaments from "../components/HomePage/UpcomingTournaments";
import Loading from "../components/General/Loading";
import AllTimeGroupLeaderboard from "../components/Leaderboards/AllTimeGroupLeaderboard";
import SecondaryBox from "../components/General/SecondaryBox";
import CustomTooltip from "../components/General/CustomTooltip";
import { useRouter } from "next/navigation";
import theme from "../styles/theme";

const HomePage = () => {
    const { data: session, status } = useSession();
    const [groupIds, setGroupIds] = useState<number[]>([]);
    const [userId, setUserId] = useState<number>();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

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
                setIsAdmin(data.isAdmin);
            } catch (error) {
                console.error("Error fetching user ID: ", error);
            }
        };
        if (session?.user.email) fetchUserId();
    }, [session?.user.email]);

    useEffect(() => {
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
            fetchGroupIds();
        }
    }, [userId]);

    const router = useRouter();
    const handleAdmin = () => {
        router.push(`/admin`);
    };

    const [loadedCount, setLoadedCount] = useState<number>(0);

    const handleLoaded = () => {
        setLoadedCount((prev) => prev + 1);
    };

    const allLoaded = loadedCount == 3;

    return (
        <Container
            maxWidth="lg"
            sx={{
                mt: 1,
                display: "flex",
                flexDirection: "column",
                //alignItems: "top",
                justifyContent: "center",
            }}
        >
            {/* Overlay Loading Spinner */}
            {!allLoaded && (
                <Box
                    sx={{
                        position: "fixed",
                        top: "80px", // height of your navbar
                        left: 0,
                        width: "100vw",
                        height: "calc(100vh - 80px)", // remaining height
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        zIndex: 10,
                        transition: "opacity 0.3s ease-in-out",
                    }}
                >
                    <Loading />
                </Box>
            )}

            {/* Actual Page Content */}
            <Box
                sx={{
                    opacity: allLoaded ? 1 : 0,
                    pointerEvents: allLoaded ? "auto" : "none",
                    transition: "opacity 0.3s ease-in-out",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "top",
                        justifyContent: "space-evenly",
                    }}
                >
                    <OngoingTournaments onLoaded={handleLoaded} />
                    <UpcomingTournaments
                        onLoaded={handleLoaded}
                        userId={userId || -1}
                    />
                </Box>
                <AllTimeLeaderboard onLoaded={handleLoaded} />

                {groupIds.length != 0 && (
                    <>
                        <SecondaryBox>All-time Group Leaderboards</SecondaryBox>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-evenly",
                                flexWrap: "wrap",
                            }}
                        >
                            {groupIds.map((groupId, index) => (
                                <AllTimeGroupLeaderboard
                                    groupId={groupId}
                                    key={index}
                                ></AllTimeGroupLeaderboard>
                            ))}
                        </Box>
                    </>
                )}
                {isAdmin && (
                    <CustomTooltip title="Add new tournament">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleAdmin}
                            sx={{
                                position: "absolute",
                                top: 100,
                                right: 50,
                                backgroundColor: theme.palette.accent.main,
                                color: theme.palette.textWhite.main,
                            }}
                        >
                            Create Tournament
                        </Button>
                    </CustomTooltip>
                )}
            </Box>
        </Container>
    );
};

export default HomePage;
