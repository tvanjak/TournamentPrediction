"use client";
import { Avatar, Box, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loading from "../components/General/Loading";
import CustomTooltip from "../components/General/CustomTooltip";
import { useRouter } from "next/navigation";
import theme from "../styles/theme";
import TournamentGroupLeaderboard from "../components/Leaderboards/TournamentGroupLeaderboards";

type Props = {};
type TournamentData = {
    id: number;
    name: string;
};

const ProfilePage = (props: Props) => {
    const { data: session, status } = useSession();
    const [totalPoints, setTotalPoints] = useState<number>();
    const [averagePoints, setAveragePoints] = useState<number>();
    const [tournamentsPlayed, setTournamentsPlayed] = useState(0);
    const [userId, setUserId] = useState<number>();
    const [isLoading, setIsLoading] = useState(true);
    const [userGroupIds, setUserGroupIds] = useState<number[]>();
    const [tournamentsData, setTournamentsData] = useState<TournamentData[]>();

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
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`/api/users/${userId}/info`);
                if (!response.ok) {
                    throw new Error("Failed to fetch user info");
                }
                const data = await response.json();
                setTotalPoints(data.totalPoints);
                setAveragePoints(data.averagePoints);
                setTournamentsPlayed(data.tournamentsPlayed);
                setUserGroupIds(data.userGroupIds);
                setTournamentsData(data.tournamentsData);
            } catch (error) {
                console.error("Error fetching user info: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (userId) {
            console.log("User ID: ", userId);
            fetchUserInfo();
        }
    }, [userId]);

    const router = useRouter();
    const viewPrediction = (tournamentId: number, userId: number) => {
        router.push(`/prediction/${tournamentId}/${userId}`);
    };
    const viewTournament = (tournamentId: number) => {
        router.push(`/tournament/${tournamentId}`);
    };

    if (isLoading || !session || !userId) return <Loading />;

    return (
        <Container
            maxWidth="lg"
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 4,
                gap: 2,
            }}
        >
            <Box
                sx={{
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
                            sx={{ width: 70, height: 70 }}
                        />
                    )}
                    {/*{!session.user.image && (
                            <AccountCircleIcon fontSize="large" />
                        )}*/}
                </Box>
                <Box>
                    <Typography>• Username: {session.user.name}</Typography>
                    <Typography>• Total points: {totalPoints}</Typography>
                    <Typography>• Average points: {averagePoints}</Typography>
                    <Typography>
                        Tournaments played: {tournamentsPlayed}
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "start",
                    width: "100%",
                    gap: 2,
                }}
            >
                <Typography variant="h4">Past tournaments</Typography>
                {tournamentsData?.map((tournament, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{ display: "flex" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "start",
                                    alignItems: "center",
                                    mr: 10,
                                }}
                            >
                                <Typography variant="h6" component={"li"}>
                                    Tournament:
                                </Typography>
                                <CustomTooltip
                                    key={index}
                                    title="View prediction"
                                >
                                    <Box
                                        onClick={() =>
                                            viewTournament(tournament.id)
                                        }
                                        sx={{
                                            maxWidth: "250px",
                                            borderRadius: 4,
                                            textAlign: "left",
                                            padding: 2,
                                            margin: 1,
                                            transition:
                                                "background-color 0.3s ease",
                                            backgroundColor:
                                                theme.palette.secondary.main,
                                            "&:hover": {
                                                backgroundColor: "#e0e0e0",
                                                cursor: "pointer",
                                            },
                                            fontSize: 16,
                                        }}
                                    >
                                        {tournament.name}
                                    </Box>
                                </CustomTooltip>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "start",
                                    alignItems: "center",
                                }}
                            >
                                <Typography variant="h6" component={"li"}>
                                    Your prediction:
                                </Typography>
                                <CustomTooltip
                                    key={index}
                                    title="View prediction"
                                >
                                    <Box
                                        onClick={() =>
                                            viewPrediction(
                                                tournament.id,
                                                userId
                                            )
                                        }
                                        sx={{
                                            maxWidth: "250px",
                                            borderRadius: 4,
                                            textAlign: "left",
                                            padding: 2,
                                            margin: 1,
                                            transition:
                                                "background-color 0.3s ease",
                                            backgroundColor:
                                                theme.palette.secondary.main,
                                            "&:hover": {
                                                backgroundColor: "#e0e0e0",
                                                cursor: "pointer",
                                            },
                                            fontSize: 16,
                                        }}
                                    >
                                        {tournament.name}
                                    </Box>
                                </CustomTooltip>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-evenly",
                                flexWrap: "wrap",
                            }}
                        >
                            {userGroupIds?.map((userGroupId, index) => (
                                <TournamentGroupLeaderboard
                                    key={index}
                                    groupId={userGroupId}
                                    tournamentId={tournament.id}
                                />
                            ))}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Container>
    );
};

export default ProfilePage;
