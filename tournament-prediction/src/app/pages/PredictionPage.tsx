"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import AccentBox from "../components/General/AccentBox";
import { ResultEnum, TournamentStatusEnum } from "@/types/enums";
import Loading from "../components/General/Loading";
import CustomTooltip from "../components/General/CustomTooltip";

import EliminationGamesPrediction from "../components/PredictionPage/EliminationGamesPrediction";
import GroupGamesPrediction from "../components/PredictionPage/GroupGamesPredictions";

import {
    handleUnlockGroupPhase,
    handleLockGroupPhase,
    handleGroupResultChange,
    handleRankingsChange,
} from "@/utils/prediction/GroupPhaseLogic";
import { handleEliminationResultChange } from "@/utils/prediction/EliminationPhaseLogic";

import {
    PredictionEliminationGamesType,
    PredictionGroupGamesType,
    Team,
    PointsSystemType,
} from "@/types/types";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import theme from "../styles/theme";

const PredictionPage = ({
    tournamentId,
    userId,
}: {
    tournamentId: number;
    userId: number;
}) => {
    const [predictionId, setPredictionId] = useState<number>();
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    const [groupGames, setGroupGames] = useState<PredictionGroupGamesType[]>(
        []
    );
    const [groupGamesLock, setGroupGamesLock] = useState<boolean>(false);
    const [eliminationGames, setEliminationGames] = useState<
        PredictionEliminationGamesType[]
    >([]);
    const [tournamentName, setTournamentName] = useState<string>();
    const [tournamentStatus, setTournamentStatus] =
        useState<TournamentStatusEnum>(TournamentStatusEnum.Upcoming);
    const [pointsSystem, setPointsSystem] = useState<PointsSystemType>();
    const [champion, setChampion] = useState<Team | null>();
    const [championPoints, setChampionPoints] = useState<number | null>(null);

    useEffect(() => {
        const fetchPredictionData = async () => {
            try {
                const groupRes = await fetch(
                    `/api/predictions/${predictionId}/group-games`
                );
                const groupData = await groupRes.json();
                setGroupGames(groupData);

                const elimRes = await fetch(
                    `/api/predictions/${predictionId}/elimination-games`
                );
                const elimData = await elimRes.json();
                setEliminationGames(elimData);

                const nameRes = await fetch(
                    `/api/tournaments/${tournamentId}/info`
                );
                const infoData = await nameRes.json();
                setTournamentName(infoData.name);
                setTournamentStatus(infoData.status);
                setPointsSystem(infoData.sports);

                const championResponse = await fetch(
                    `/api/predictions/${predictionId}/champion`
                );
                const championData = await championResponse.json();
                setChampion(championData);
            } catch (err) {
                console.error("Failed to load prediction:", err);
            } finally {
                setLoading(false);
            }
        };

        if (predictionId && tournamentId) fetchPredictionData();
    }, [predictionId]);

    useEffect(() => {
        const fetchIsAdmin = async () => {
            try {
                const res = await fetch(
                    `/api/users/getIdByEmail?email=${session?.user.email}`
                );
                if (!res.ok) {
                    throw new Error("Failed to fetch user id with eamil");
                }
                const data = await res.json();
                setIsAdmin(data.isAdmin);
            } catch (error) {
                console.log("Error while fetching userId: ", error);
            }
        };
        const fetchPredictionId = async () => {
            try {
                const res = await fetch("/api/getData/getPredictionId", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId, tournamentId }),
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch prediction ID");
                }
                const data = await res.json();
                setPredictionId(Number(data.predictionId));
                setChampionPoints(
                    data.championPoints != null
                        ? Number(data.championPoints)
                        : null
                );
            } catch (error) {
                console.log("Error when fetching predictionId: ", error);
            }
        };
        console.log(tournamentId);
        console.log(userId);
        if (session?.user.email) fetchIsAdmin();
        if (tournamentId && userId) fetchPredictionId();
    }, [tournamentId, userId, session?.user.email]);

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
    const handleSavePrediction = async () => {
        try {
            await fetch(`/api/predictions/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    predictionId,
                    groupGames,
                    eliminationGames,
                    champion,
                }),
            });
            alert("Prediction saved successfully");
        } catch (err) {
            console.error("Failed to save prediction:", err);
            alert("Failed to save prediction");
        }
    };

    const handleTournamentStart = async () => {
        try {
            await fetch(`/api/tournaments/start`);
            alert("Tournament set to ONGOING successfuly.");
        } catch (err) {
            console.error("Failed to start tournament:", err);
            alert("Failed to start tournament");
        }
    };

    const router = useRouter();
    const handleGoToTournament = async () => {
        router.push(`/tournament/${tournamentId}`);
    };

    return (
        <Box>
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
                <AccentBox>{tournamentName} – Prediction</AccentBox>

                <Box mb={4} mt={2}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "start",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Typography variant="h4">Group Stage</Typography>
                        {tournamentStatus == TournamentStatusEnum.Upcoming ? (
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
                    <GroupGamesPrediction
                        adjustRankings={onRankingsChange}
                        groupGamesLock={groupGamesLock}
                        tournamentStatus={tournamentStatus}
                        groups={groupGames}
                        onResultChange={onGroupResultChange}
                    />
                </Box>

                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>
                        Elimination Stage
                    </Typography>
                    <EliminationGamesPrediction
                        tournamentStatus={tournamentStatus}
                        eliminationGames={eliminationGames}
                        onResultChange={onEliminationResultChange}
                    />
                </Box>

                <Box mt={2} mb={6}>
                    <Typography variant="h3" color="Goldenrod">
                        🏆Champion: {champion?.countries?.name || "N/A"}
                    </Typography>
                    {tournamentStatus == TournamentStatusEnum.Ongoing && (
                        <Typography
                            variant="h5"
                            sx={{
                                mt: 1,
                                textAlign: "center",
                            }}
                        >
                            Points awarded:{" "}
                            {championPoints != null ? championPoints : "N/A"}
                        </Typography>
                    )}
                </Box>

                {tournamentStatus == TournamentStatusEnum.Upcoming && (
                    <CustomTooltip title="Update prediction">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSavePrediction}
                            sx={{ position: "absolute", top: 100, right: 50 }}
                        >
                            Save Prediction
                        </Button>
                    </CustomTooltip>
                )}
                {tournamentStatus == TournamentStatusEnum.Upcoming &&
                    isAdmin && (
                        <CustomTooltip title="Update prediction">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleTournamentStart}
                                sx={{
                                    backgroundColor: theme.palette.accent.main,
                                    color: theme.palette.textWhite.main,
                                    position: "absolute",
                                    top: 150,
                                    right: 50,
                                }}
                            >
                                Start Tournament
                            </Button>
                        </CustomTooltip>
                    )}
                {tournamentStatus == TournamentStatusEnum.Ongoing && (
                    <CustomTooltip title="Go to actual tournament">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleGoToTournament}
                            sx={{ position: "absolute", top: 100, right: 50 }}
                        >
                            View Tournament
                        </Button>
                    </CustomTooltip>
                )}
            </Box>
        </Box>
    );
};

export default PredictionPage;
