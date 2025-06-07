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
import theme from "../styles/theme";

import EliminationGames from "../components/TournamentPage/EliminationGames";
import GroupGames from "../components/TournamentPage/GroupGames";

import {
    handleUnlockGroupPhase,
    handleLockGroupPhase,
    handleGroupResultChange,
    handleRankingsChange,
} from "@/utils/tournament/GroupPhaseLogic";
import { handleEliminationResultChange } from "@/utils/tournament/EliminationPhaseLogic";

import {
    TournamentEliminationGamesType,
    TournamentGroupGamesType,
    Team,
    PointsSystemType,
} from "@/types/types";

interface Props {
    tournamentId: number;
}

const TournamentPage = ({ tournamentId }: Props) => {
    const [loading, setLoading] = useState(true);
    const [groupGames, setGroupGames] = useState<TournamentGroupGamesType[]>(
        []
    );
    const [groupGamesLock, setGroupGamesLock] = useState(false);
    const [eliminationGames, setEliminationGames] = useState<
        TournamentEliminationGamesType[]
    >([]);
    const [tournamentName, setTournamentName] = useState<string>();
    const [champion, setChampion] = useState<Team | null>();

    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [adminMode, setAdminMode] = useState(false);
    const [userId, setUserId] = useState<number>();
    const [groupIds, setGroupIds] = useState<number[]>();

    const [pointsSystem, setPointsSystem] = useState<PointsSystemType>();

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
                setIsAdmin(data.isAdmin);
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

                const infoResponse = await fetch(
                    `/api/tournaments/${tournamentId}/info`
                );
                const infoData = await infoResponse.json();

                const championResponse = await fetch(
                    `/api/tournaments/${tournamentId}/champion`
                );
                const championData = await championResponse.json();

                setGroupGames(groupData);
                setEliminationGames(eliminationData);
                setTournamentName(infoData.name);
                setPointsSystem(infoData.sports);
                setChampion(championData);
            } catch (error) {
                console.error("Error fetching tournament data:", error);
            } finally {
                setLoading(false);
            }
        };
        if (session?.user.email) fetchUserId();
        if (userId) fetchGroupIds();
        if (userId && tournamentId) fetchTournamentData();
    }, [tournamentId, session?.user.email, userId]);

    const router = useRouter();
    const handleGoToPrediction = async () => {
        router.push(`/prediction/${tournamentId}/${userId}`);
    };

    const handleAdminMode = () => {
        setAdminMode(!adminMode);
    };

    const onGroupResultChange = (
        gameId: number,
        groupId: number,
        value: ResultEnum
    ) => {
        handleGroupResultChange(
            gameId,
            groupId,
            value,
            setGroupGames,
            pointsSystem!
        );
    };

    const onRankingsChange = (team: Team) => {
        handleRankingsChange(team, setGroupGames);
    };

    const onLockGroupPhase = async () => {
        await handleLockGroupPhase(
            tournamentId,
            groupGames,
            eliminationGames,
            setGroupGamesLock,
            setEliminationGames,
            setChampion
        );
    };

    const onUnlockGroupPhase = () => {
        handleUnlockGroupPhase(
            eliminationGames,
            setGroupGamesLock,
            setEliminationGames,
            setChampion
        );
    };

    const onEliminationResultChange = (
        gameId: number,
        roundId: number,
        newWinner?: Team,
        previousWinnerId?: number
    ) => {
        handleEliminationResultChange(
            gameId,
            roundId,
            newWinner,
            previousWinnerId,
            setEliminationGames,
            setChampion
        );
    };

    const handleSaveChanges = async () => {
        try {
            await fetch(`/api/tournaments/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tournamentId,
                    groupGames,
                    eliminationGames,
                    champion,
                }),
            });
            alert("Changes saved successfully");
        } catch (err) {
            console.error("Failed to save change to tournament:", err);
            alert("Failed to save change to tournament");
        } finally {
            setAdminMode(false);
        }
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
                        top: "80px", // height of navbar
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
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "start",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography variant="h4" gutterBottom>
                            Group Stage
                        </Typography>
                        {adminMode ? (
                            !groupGamesLock ? (
                                <CustomTooltip title="Confirm group predictions">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={onLockGroupPhase}
                                        sx={{
                                            ml: 2,
                                            backgroundColor: "white",
                                        }}
                                    >
                                        Lock Group Phase
                                    </Button>
                                </CustomTooltip>
                            ) : (
                                <CustomTooltip title="Revise group predictions">
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={onUnlockGroupPhase}
                                        sx={{
                                            ml: 2,
                                            backgroundColor: "white",
                                        }}
                                    >
                                        Unlock Group Phase
                                    </Button>
                                </CustomTooltip>
                            )
                        ) : (
                            <></>
                        )}
                    </Box>
                    <GroupGames
                        groupGamesLock={groupGamesLock}
                        groups={groupGames}
                        adminMode={adminMode}
                        onResultChange={onGroupResultChange}
                        adjustRankings={onRankingsChange}
                    />
                </Box>

                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>
                        Elimination Stage
                    </Typography>
                    <EliminationGames
                        eliminationGames={eliminationGames}
                        adminMode={adminMode}
                        onResultChange={onEliminationResultChange}
                    />
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
                {isAdmin && !adminMode && (
                    <CustomTooltip title="Fill tournament results">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleAdminMode}
                            sx={{
                                backgroundColor: theme.palette.accent.main,
                                color: theme.palette.textWhite.main,
                                position: "absolute",
                                top: 150,
                                right: 50,
                            }}
                        >
                            Admin mode on
                        </Button>
                    </CustomTooltip>
                )}
                {isAdmin && adminMode && (
                    <CustomTooltip title="Turn off admin mode">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleAdminMode}
                            sx={{
                                backgroundColor: theme.palette.accent.main,
                                color: theme.palette.textWhite.main,
                                position: "absolute",
                                top: 150,
                                right: 50,
                            }}
                        >
                            Admin mode off
                        </Button>
                    </CustomTooltip>
                )}
                {isAdmin && adminMode && (
                    <CustomTooltip title="Upload changes to database">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSaveChanges}
                            sx={{
                                backgroundColor: theme.palette.accent.main,
                                color: theme.palette.textWhite.main,
                                position: "absolute",
                                top: 200,
                                right: 50,
                            }}
                        >
                            Save changes
                        </Button>
                    </CustomTooltip>
                )}
            </Box>
        </Box>
    );
};

export default TournamentPage;
