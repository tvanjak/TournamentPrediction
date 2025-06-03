"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import AccentBox from "../components/General/AccentBox";
import PrimaryBox from "../components/General/PrimaryBox";
import TournamentLeaderboard from "../components/Leaderboards/TournamentLeaderboard";
import TournamentGroupLeaderboard from "../components/Leaderboards/TournamentGroupLeaderboards";
import { useSession } from "next-auth/react";
import Loading from "../components/General/Loading";
import { ResultEnum } from "@/types/enums";
import CustomTooltip from "../components/General/CustomTooltip";
import { useRouter } from "next/navigation";
import EliminationGames from "../components/TournamentPage/EliminationGames";
import GroupGames from "../components/TournamentPage/GroupGames";

interface Team {
    id: number;
    countries?: { name: string };
}

type GroupGamesType = {
    groupName: string;
    games: {
        id: number;
        team1?: { countries?: { name: string } };
        team2?: { countries?: { name: string } };
        result?: ResultEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        team: Team;
    }[];
};

interface EliminationGameType {
    id: number;
    rounds?: { name: string };
    team1?: { countries?: { name: string } };
    team2?: { countries?: { name: string } };
    team_winner?: { countries?: { name: string } };
    result?: string;
}

interface Props {
    tournamentId: number;
}

// Main Page Component
const TournamentPage = ({ tournamentId }: Props) => {
    const [loading, setLoading] = useState(true);
    const [groupGames, setGroupGames] = useState<GroupGamesType[]>([]);
    const [eliminationGames, setEliminationGames] = useState<
        { name: string; games: EliminationGameType[] }[]
    >([]);
    const [tournamentName, setTournamentName] = useState<string>();
    const [champion, setChampion] = useState<Team>();

    const { data: session } = useSession();
    const [userId, setUserId] = useState<number>();
    const [groupIds, setGroupIds] = useState<number[]>();

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const res = await fetch(
                    `/api/users/getIdByEmail?email=${session?.user.email}`
                );
                if (!res.ok) {
                    throw new Error("Failed to fetch user id with eamil");
                }
                const data = await res.json();
                setUserId(data.userId);
            } catch (error) {
                console.log("Error while fetching userId: ", error);
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
        const fetchTournamentData = async () => {
            try {
                const groupResponse = await fetch(
                    `/api/tournaments/${tournamentId}/group-games`
                );
                const groupData = await groupResponse.json();

                const eliminationResponse = await fetch(
                    `/api/tournaments/${tournamentId}/elimination-games`
                );
                const eliminationData = await eliminationResponse.json();
                const nameResponse = await fetch(
                    `/api/tournaments/${tournamentId}/info`
                );
                const nameData = await nameResponse.json();
                const championResponse = await fetch(
                    `/api/tournaments/${tournamentId}/champion`
                );
                const championData = await championResponse.json();
                console.log("Group: ", groupData);
                console.log("Elimination: ", eliminationData);
                console.log("Name:", nameData);
                console.log("Champion: ", championData);
                setGroupGames(groupData);
                setEliminationGames(eliminationData);
                setTournamentName(nameData.name);
                setChampion(championData);
            } catch (error) {
                console.error("Error fetching tournament data:", error);
            } finally {
                setLoading(false);
            }
        };
        console.log("In useEffect.");
        console.log("group games: ", groupGames);
        console.log("elimination games: ", eliminationGames);
        console.log("tournament name: ", tournamentName);

        if (session?.user.email) fetchUserId();
        if (userId) fetchGroupIds();
        if (userId && tournamentId) fetchTournamentData();
    }, [tournamentId, session?.user.email, userId]);

    const router = useRouter();
    const handleGoToPrediction = async () => {
        router.push(`/prediction/${tournamentId}/${userId}`);
    };

    return (
        <Box
            sx={{
                minHeight: loading ? "100vh" : "auto",
                overflow: "hidden",
            }}
        >
            {loading && (
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
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    p: 3,
                    opacity: loading ? 0 : 1,
                    transition: "opacity 0.3s ease-in-out",
                    pointerEvents: loading ? "none" : "auto",
                }}
            >
                <AccentBox>{tournamentName}</AccentBox>

                <Box mb={4}>
                    <Typography variant="h4" gutterBottom>
                        Group Stage
                    </Typography>
                    <GroupGames groups={groupGames} />
                </Box>

                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>
                        Elimination Stage
                    </Typography>
                    <EliminationGames eliminationGames={eliminationGames} />
                </Box>

                <Box mt={4} mb={6}>
                    <Typography variant="h3">
                        🏆Champion: {champion?.countries?.name || "N/A"}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "top",
                        borderTop: "2px solid black",
                    }}
                >
                    <TournamentLeaderboard
                        tournamentId={tournamentId}
                    ></TournamentLeaderboard>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            p: 3,
                        }}
                    >
                        {groupIds?.length != 0 && (
                            <>
                                <PrimaryBox>Group Leaderboards:</PrimaryBox>
                                <Box>
                                    {groupIds && (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-evenly",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            {groupIds.map((groupId, index) => (
                                                <TournamentGroupLeaderboard
                                                    groupId={groupId}
                                                    tournamentId={Number(
                                                        tournamentId
                                                    )}
                                                    key={index}
                                                ></TournamentGroupLeaderboard>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
                <CustomTooltip title="Go to your prediction">
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleGoToPrediction}
                        sx={{ position: "absolute", top: 100, right: 50 }}
                    >
                        View Prediction
                    </Button>
                </CustomTooltip>
            </Box>
        </Box>
    );
};

export default TournamentPage;
