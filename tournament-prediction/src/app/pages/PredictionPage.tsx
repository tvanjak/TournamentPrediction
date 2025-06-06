"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import AccentBox from "../components/General/AccentBox";
import { ResultEnum, StatusEnum, TournamentStatusEnum } from "@/types/enums";
import Loading from "../components/General/Loading";
import CustomTooltip from "../components/General/CustomTooltip";

import EliminationGamesPrediction from "../components/PredictionPage/EliminationGamesPrediction";
import GroupGamesPrediction from "../components/PredictionPage/GroupGamesPredictions";

type Team = {
    id: number;
    countries?: { name: string };
};

type GroupGames = {
    groupId: number;
    groupName: string;
    games: {
        id: number;
        team1?: Team;
        team2?: Team;
        predicted_result?: ResultEnum;
        points_awarded: number;
        status: StatusEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        team: Team;
    }[];
};

type EliminationGames = {
    roundName: string;
    roundId: number;
    games: {
        id: number;
        actual_game_id: number;
        rounds?: { name: string };
        team1?: Team;
        team2?: Team;
        predicted_winner_id?: number;
        points_awarded?: number;
        status: StatusEnum;
    }[];
};

type Matchup = {
    round_id: number;
    team1: string;
    team2: string;
    rounds: { id: number; name: string };
};

type PointsSystemType = {
    points_win: number;
    points_draw: number;
    points_loss: number;
};

const PredictionPage = ({
    tournamentId,
    userId,
}: {
    tournamentId: number;
    userId: number;
}) => {
    const [predictionId, setPredictionId] = useState<number>();
    const [loading, setLoading] = useState(true);

    const [groupGames, setGroupGames] = useState<GroupGames[]>([]);
    const [groupGamesLock, setGroupGamesLock] = useState<boolean>(false);
    const [eliminationGames, setEliminationGames] = useState<
        EliminationGames[]
    >([]);
    const [tournamentName, setTournamentName] = useState<string>();
    const [tournamentStatus, setTournamentStatus] =
        useState<TournamentStatusEnum>(TournamentStatusEnum.Upcoming);
    const [pointsSystem, setPointsSystem] = useState<PointsSystemType>();
    const [champion, setChampion] = useState<Team | null>();
    const [championPoints, setChampionPoints] = useState<number>();

    useEffect(() => {
        const fetchPredictionData = async () => {
            try {
                const groupRes = await fetch(
                    `/api/predictions/${predictionId}/group-games`
                );
                const groupData = await groupRes.json();
                console.log("groupData: ", groupData);
                setGroupGames(groupData);

                const elimRes = await fetch(
                    `/api/predictions/${predictionId}/elimination-games`
                );
                const elimData = await elimRes.json();
                //console.log("elimData: ", elimData);
                setEliminationGames(elimData);

                const nameRes = await fetch(
                    `/api/tournaments/${tournamentId}/info`
                );
                const infoData = await nameRes.json();
                console.log("INFO: ", infoData);
                setTournamentName(infoData.name);
                setTournamentStatus(infoData.status);
                setPointsSystem(infoData.sports);

                const championResponse = await fetch(
                    `/api/predictions/${predictionId}/champion`
                );
                const championData = await championResponse.json();
                setChampion(championData);
                console.log("CHAMP: ", championData);
            } catch (err) {
                console.error("Failed to load prediction:", err);
            } finally {
                setLoading(false);
            }
        };

        if (predictionId && tournamentId) fetchPredictionData();
    }, [predictionId]);

    useEffect(() => {
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
                setChampionPoints(Number(data.championPoints));
            } catch (error) {
                console.log("Error when fetching predictionId: ", error);
            }
        };
        console.log(tournamentId);
        console.log(userId);
        if (tournamentId && userId) fetchPredictionId();
    }, [tournamentId, userId]);

    const handleGroupResultChange = (
        gameId: number,
        groupId: number,
        value: ResultEnum
    ) => {
        setGroupGames((prevGroups) =>
            prevGroups.map((group) => {
                if (group.groupId != groupId) {
                    return group;
                }

                // Update games
                const updatedGames = group.games.map((game) =>
                    game.id === gameId
                        ? { ...game, predicted_result: value }
                        : game
                );

                // Calculate new points per team
                const pointsMap: Record<
                    number,
                    { team: Team; points: number }
                > = {};

                for (const game of updatedGames) {
                    const { team1, team2, predicted_result } = game;

                    //if (!team1 || !team2 || !predicted_result) continue;

                    // Initialize teams
                    if (!pointsMap[team1!.id])
                        pointsMap[team1!.id] = { team: team1!, points: 0 };
                    if (!pointsMap[team2!.id])
                        pointsMap[team2!.id] = { team: team2!, points: 0 };

                    // Apply scoring rules--------------------------------------------------------------------------
                    if (predicted_result === ResultEnum.HomeWin) {
                        pointsMap[team1!.id].points += pointsSystem!.points_win;
                    } else if (predicted_result === ResultEnum.AwayWin) {
                        pointsMap[team2!.id].points += pointsSystem!.points_win;
                    } else if (predicted_result === ResultEnum.Draw) {
                        pointsMap[team1!.id].points +=
                            pointsSystem!.points_draw;
                        pointsMap[team2!.id].points +=
                            pointsSystem!.points_draw;
                    }
                }
                console.log("RANKING before: ", pointsMap);

                // Convert to rankings array and sort
                const rankings = Object.values(pointsMap)
                    .sort((a, b) => b.points - a.points)
                    .map((entry, index) => ({
                        rank: index + 1,
                        points: entry.points,
                        team: entry.team,
                    }));

                console.log("RANKING after: ", rankings);

                return {
                    ...group,
                    games: updatedGames,
                    rankings,
                };
            })
        );
    };

    const adjustRankings = (team: Team) => {
        setGroupGames((prevGroups) =>
            prevGroups.map((group) => {
                const changeIndex = group.rankings.findIndex(
                    (r) => r.team.id === team.id
                );

                if (changeIndex > 0) {
                    const newRankings = [...group.rankings];

                    // Swap rank values
                    const tempRank = newRankings[changeIndex - 1].rank;
                    newRankings[changeIndex - 1] = {
                        ...newRankings[changeIndex - 1],
                        rank: newRankings[changeIndex].rank,
                    };
                    newRankings[changeIndex] = {
                        ...newRankings[changeIndex],
                        rank: tempRank,
                    };

                    // Sort the rankings again by updated rank
                    newRankings.sort((a, b) => a.rank - b.rank);

                    return {
                        ...group,
                        rankings: newRankings,
                    };
                }

                return group;
            })
        );
    };

    const handleEliminationResultChange = (
        gameId: number,
        roundId: number,
        newWinner?: Team,
        previousWinnerId?: number
    ) => {
        if (newWinner?.id == previousWinnerId) return;

        setEliminationGames((prevRounds) => {
            let changedRoundIndex = -1;

            // Update the selected game and find which round it's in
            let updatedRounds = prevRounds.map((round) => {
                const hasTargetGame = round.games.some(
                    (game) => game.id === gameId
                );
                if (hasTargetGame) changedRoundIndex = round.roundId;

                return {
                    ...round,
                    games: round.games.map((game) => {
                        const clonedGame = { ...game }; // shallow copy
                        if (game.id === gameId) {
                            clonedGame.predicted_winner_id = newWinner?.id;
                        }
                        return clonedGame;
                    }),
                };
            });

            if (changedRoundIndex > 1) {
                let GameIndexInRound;

                for (let i = 0; i < updatedRounds.length; i++) {
                    if (updatedRounds[i].roundId == changedRoundIndex) {
                        for (
                            let j = 0;
                            j < updatedRounds[i].games.length;
                            j++
                        ) {
                            if (updatedRounds[i].games[j].id == gameId) {
                                GameIndexInRound = j;
                            }
                        }
                    }
                }

                let winnerIds_array = [previousWinnerId];
                for (let i = 0; i < updatedRounds.length; i++) {
                    let updatedGame = false;
                    if (updatedRounds[i].roundId < roundId && !updatedGame) {
                        GameIndexInRound = Math.floor(GameIndexInRound! / 2);

                        //GLEDAMO RUNDU NEPOSREDNO NAKON
                        if (updatedRounds[i].roundId == roundId - 1) {
                            if (
                                updatedRounds[i].games[GameIndexInRound].team1
                                    ?.id == previousWinnerId &&
                                previousWinnerId &&
                                !updatedGame
                            ) {
                                updatedGame = true;
                                updatedRounds[i].games[GameIndexInRound].team1 =
                                    newWinner;
                                updatedRounds[i].games[
                                    GameIndexInRound
                                ].predicted_winner_id = undefined;
                                if (
                                    updatedRounds[i].games[GameIndexInRound]
                                        .team2?.id != undefined
                                ) {
                                    winnerIds_array.push(
                                        updatedRounds[i].games[GameIndexInRound]
                                            .team2!.id
                                    );
                                }
                            } else if (
                                updatedRounds[i].games[GameIndexInRound].team2
                                    ?.id == previousWinnerId &&
                                previousWinnerId &&
                                !updatedGame
                            ) {
                                updatedGame = true;
                                updatedRounds[i].games[GameIndexInRound].team2 =
                                    newWinner;
                                updatedRounds[i].games[
                                    GameIndexInRound
                                ].predicted_winner_id = undefined;
                                if (
                                    updatedRounds[i].games[GameIndexInRound]
                                        .team1?.id != undefined
                                ) {
                                    winnerIds_array.push(
                                        updatedRounds[i].games[GameIndexInRound]
                                            .team1!.id
                                    );
                                }
                            } else if (!updatedGame) {
                                if (
                                    updatedRounds[i].games[GameIndexInRound]
                                        .team1 == undefined
                                ) {
                                    updatedRounds[i].games[
                                        GameIndexInRound
                                    ].team1 = newWinner;
                                    updatedGame = true;
                                } else if (
                                    updatedRounds[i].games[GameIndexInRound]
                                        .team2 == undefined
                                ) {
                                    updatedRounds[i].games[
                                        GameIndexInRound
                                    ].team2 = newWinner;
                                    updatedGame = true;
                                }
                            }
                        }
                        //GLEDAMO OSTALE RUNDE (PROPAGIRAMO PROMJENE)
                        else {
                            if (
                                //NAIŠLI SMO NA UTAKMICU U KOJOJ TREBAMO PROPAGIRATI PROMJENE IZ RANIJE FAZE
                                updatedRounds[i].games[GameIndexInRound].team1
                                    ?.id &&
                                winnerIds_array.includes(
                                    updatedRounds[i].games[GameIndexInRound]
                                        .team1?.id
                                ) &&
                                !updatedGame
                            ) {
                                updatedGame = true;
                                updatedRounds[i].games[GameIndexInRound].team1 =
                                    undefined;
                                updatedRounds[i].games[
                                    GameIndexInRound
                                ].predicted_winner_id = undefined;
                                if (
                                    updatedRounds[i].games[GameIndexInRound]
                                        .team2?.id != undefined
                                )
                                    winnerIds_array.push(
                                        updatedRounds[i].games[GameIndexInRound]
                                            .team2!.id
                                    );
                            } else if (
                                //NAIŠLI SMO NA UTAKMICU U KOJOJ TREBAMO PROPAGIRATI PROMJENE IZ RANIJE FAZE
                                updatedRounds[i].games[GameIndexInRound].team2
                                    ?.id &&
                                winnerIds_array.includes(
                                    updatedRounds[i].games[GameIndexInRound]
                                        .team2?.id
                                ) &&
                                !updatedGame
                            ) {
                                updatedGame = true;
                                updatedRounds[i].games[GameIndexInRound].team2 =
                                    undefined;
                                updatedRounds[i].games[
                                    GameIndexInRound
                                ].predicted_winner_id = undefined;
                                if (
                                    updatedRounds[i].games[GameIndexInRound]
                                        .team1?.id != undefined
                                )
                                    winnerIds_array.push(
                                        updatedRounds[i].games[GameIndexInRound]
                                            .team1!.id
                                    );
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < updatedRounds.length; i++) {
                if (updatedRounds[i].roundId == 1) {
                    if (!updatedRounds[i].games[0].predicted_winner_id) {
                        setChampion(null);
                    }
                }
            }
            if (roundId == 1) {
                setChampion(newWinner);
            }

            return updatedRounds;
        });
    };

    const handleSavePrediction = async () => {
        try {
            //console.log("GROUP DATA for save: ", groupGames);
            //console.log("ELIM DATA for save: ", eliminationGames);
            //console.log("CHAMPION: ", champion);
            await fetch(`/api/predictions/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tournamentId,
                    userId,
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

    const handleLockGroupPhase = async () => {
        setGroupGamesLock(true);

        //pomocu elimination_matchups izradi elimination games
        const constructEliminationPhase = async () => {
            try {
                const res = await fetch(
                    `/api/tournaments/${tournamentId}/elimination-matchups`
                );
                if (!res.ok) {
                    throw new Error("Failed to fetch elimination matchups!");
                }
                const data = await res.json();
                const matchups = data as Matchup[];

                //--
                const teamMap: Record<string, Team | undefined> = {};
                groupGames.forEach((group) => {
                    const rankings = group.rankings;

                    // if (rankings.length >= 2) {
                    //     teamMap[`${group.groupName}1`] = rankings.find(
                    //         (r) => r.rank === 1
                    //     )?.team;
                    //     teamMap[`${group.groupName}2`] = rankings.find(
                    //         (r) => r.rank === 2
                    //     )?.team;
                    // }
                    // if (rankings.length >= 3) {
                    //     teamMap[`${group.groupName}3`] = rankings.find(
                    //         (r) => r.rank === 3
                    //     )?.team;
                    // }
                    // if (rankings.length >= 4) {
                    //     teamMap[`${group.groupName}4`] = rankings.find(
                    //         (r) => r.rank === 4
                    //     )?.team;
                    // }

                    for (let i = 1; i <= rankings.length; i++) {
                        teamMap[`${group.groupName}${i}`] = rankings.find(
                            (r) => r.rank === i
                        )?.team;
                    }
                });

                const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

                const newEliminationGames = deepCopy(eliminationGames);

                newEliminationGames.forEach((round: any) => {
                    if (round.roundId == matchups[0].round_id) {
                        let matchupCounter = 0;
                        round.games.forEach((game: any) => {
                            game.team1 =
                                teamMap[matchups[matchupCounter].team1];
                            game.team2 =
                                teamMap[matchups[matchupCounter].team2];
                            game.predicted_winner_id = undefined;
                            game.status = StatusEnum.Pending;
                            matchupCounter++;
                        });
                    } else {
                        round.games.forEach((game: any) => {
                            game.team1 = undefined;
                            game.team2 = undefined;
                            game.predicted_winner_id = undefined;
                            game.status = StatusEnum.Pending;
                        });
                    }
                });

                console.log("NEW elim games in LOCK: ", newEliminationGames);
                newEliminationGames.sort(
                    (a: any, b: any) => b.roundId - a.roundId
                );
                setEliminationGames(newEliminationGames);
            } catch (error) {
                console.error("Failed to fetch matchups!", error);
            }
        };
        constructEliminationPhase();
        setChampion(null);
    };

    const handleUnlockGroupPhase = async () => {
        setGroupGamesLock(false);

        const deepCopy = (obj: any) => JSON.parse(JSON.stringify(obj));

        const newEliminationGames = deepCopy(eliminationGames);
        newEliminationGames.forEach((round: any) => {
            round.games.forEach((game: any) => {
                game.team1 = undefined;
                game.team2 = undefined;
                (game.predicted_winner_id = undefined),
                    (game.status = StatusEnum.Pending);
            });
        });

        console.log("NEW elim games in UNLOCK: ", newEliminationGames);
        newEliminationGames.sort((a: any, b: any) => b.roundId - a.roundId);
        setEliminationGames(newEliminationGames);
        setChampion(null);
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
                                        onClick={handleLockGroupPhase}
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
                                        onClick={handleUnlockGroupPhase}
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
                        adjustRankings={adjustRankings}
                        groupGamesLock={groupGamesLock}
                        tournamentStatus={tournamentStatus}
                        groups={groupGames}
                        onResultChange={handleGroupResultChange}
                    />
                </Box>

                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>
                        Elimination Stage
                    </Typography>
                    <EliminationGamesPrediction
                        tournamentStatus={tournamentStatus}
                        eliminationGames={eliminationGames}
                        onResultChange={handleEliminationResultChange}
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
                            {championPoints != undefined
                                ? championPoints
                                : "N/A"}
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
            </Box>
        </Box>
    );
};

export default PredictionPage;
