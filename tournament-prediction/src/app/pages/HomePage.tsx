"use client";
import React, { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Box, Button, Container } from "@mui/material";
import AllTimeLeaderboard from "../components/Leaderboards/AllTimeLeaderboard";
import OngoingTournaments from "../components/HomePage/OngoingTournaments";
import UpcomingTournaments from "../components/HomePage/UpcomingTournaments";
import Loading from "../components/General/Loading";
import AllTimeGroupLeaderboard from "../components/Leaderboards/AllTimeGroupLeaderboard";
import SecondaryBox from "../components/General/SecondaryBox";
import Link from "next/link";
import CustomTooltip from "../components/General/CustomTooltip";
import { useRouter } from "next/navigation";
import theme from "../styles/theme";

type Props = {};

const HomePage = (props: Props) => {
    const { data: session, status } = useSession();
    //const [totalPoints, setTotalPoints] = useState<number>();
    //const [averagePoints, setAveragePoints] = useState<number>();
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
            //fetchTotalPoints();
            //fetchAveragePoints();
            fetchGroupIds();
        }
    }, [userId]);

    const router = useRouter();
    const handleAdmin = () => {
        router.push(`/admin`);
    };

    const [loadedCount, setLoadedCount] = useState<number>(0);
    const totalComponents = 3;

    const handleLoaded = () => {
        setLoadedCount((prev) => prev + 1);
    };

    const expectedLoadedCount = useMemo(() => {
        return totalComponents + (groupIds?.length || 0);
    }, [groupIds]);

    const allLoaded =
        loadedCount >= expectedLoadedCount && groupIds !== undefined;

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
                    <UpcomingTournaments onLoaded={handleLoaded} />
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
                                    onLoaded={handleLoaded}
                                ></AllTimeGroupLeaderboard>
                            ))}
                        </Box>
                    </>
                )}
            </Box>
            {isAdmin && (
                <CustomTooltip title="Add new tournament">
                    <Button
                        variant="contained"
                        size="medium"
                        onClick={handleAdmin}
                        sx={{
                            position: "absolute",
                            top: 22,
                            right: 100,
                            backgroundColor: theme.palette.accent.main,
                            color: theme.palette.textWhite.main,
                        }}
                    >
                        Create Tournament
                    </Button>
                </CustomTooltip>
            )}
        </Container>
    );
};

export default HomePage;
