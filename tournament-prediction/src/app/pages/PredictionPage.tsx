"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import AccentBox from "../components/General/AccentBox";
import { ResultEnum, StatusEnum, TournamentStatusEnum } from "@/types/enums";
import Loading from "../components/General/Loading";
import theme from "../styles/theme";
import CustomTooltip from "../components/General/CustomTooltip";

import EliminationGamesPrediction from "../components/PredictionPage/EliminationGamesPrediction";
import GroupGamesPrediction from "../components/PredictionPage/GroupGamesPredictions";

interface Team {
    id: number;
    countries?: { name: string };
}

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

interface EliminationGames {
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
}

interface Matchup {
    round_id: number;
    team1: string;
    team2: string;
    rounds: { id: number; name: string };
}

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
    const [champion, setChampion] = useState<Team | null>();
    const [championPoints, setChampionPoints] = useState<number>();

    useEffect(() => {
        const fetchPredictionData = async () => {
            try {
                const groupRes = await fetch(
                    `/api/predictions/${predictionId}/group-games`
                );
                const groupData = await groupRes.json();
                //console.log("groupData: ", groupData);
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
                setTournamentName(infoData.name);
                setTournamentStatus(infoData.status);

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

    const handleGroupResultChange = (gameId: number, value: ResultEnum) => {
        setGroupGames((prevGroups) =>
            prevGroups.map((group) => {
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

                    if (!team1 || !team2 || !predicted_result) continue;

                    // Initialize teams
                    if (!pointsMap[team1.id])
                        pointsMap[team1.id] = { team: team1, points: 0 };
                    if (!pointsMap[team2.id])
                        pointsMap[team2.id] = { team: team2, points: 0 };

                    // Apply scoring rules-------------------------------------------------------------------------- RIGHT NOW JUST FOR FOOTBALL
                    if (predicted_result === ResultEnum.HomeWin) {
                        pointsMap[team1.id].points += 3;
                    } else if (predicted_result === ResultEnum.AwayWin) {
                        pointsMap[team2.id].points += 3;
                    } else if (predicted_result === ResultEnum.Draw) {
                        pointsMap[team1.id].points += 1;
                        pointsMap[team2.id].points += 1;
                    }
                }

                // Convert to rankings array and sort
                const rankings = Object.values(pointsMap)
                    .sort((a, b) => b.points - a.points)
                    .map((entry, index) => ({
                        rank: index + 1,
                        points: entry.points,
                        team: entry.team,
                    }));

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

            // Step 1: Update the selected game and find which round it's in
            const updatedRounds = prevRounds.map((round) => {
                const hasTargetGame = round.games.some(
                    (game) => game.id === gameId
                );
                if (hasTargetGame) changedRoundIndex = round.roundId;

                return {
                    ...round,
                    games: round.games.map((game) =>
                        game.id === gameId
                            ? { ...game, predicted_winner_id: newWinner?.id }
                            : game
                    ),
                };
            });

            let winnerIds_array = [previousWinnerId];
            if (changedRoundIndex >= 0) {
                for (let i = 0; i < updatedRounds.length; i++) {
                    if (updatedRounds[i].roundId == changedRoundIndex - 1) {
                        // MIJENJAMO ELIMINACIJSKU FAZU NEPOSREDNO NAKON
                        let ChangedTeam = false;
                        console.log("Elimination games: ", eliminationGames);
                        updatedRounds[i] = {
                            ...updatedRounds[i],
                            games: updatedRounds[i].games.map((game) => {
                                if (
                                    // MIJENJAMO UTAKMICU U KOJOJ JE team1 BIO PRIJAŠNJI POBJEDNIK UPRAVO PROMIJENJENE UTAKMICE
                                    game.team1?.id == previousWinnerId &&
                                    previousWinnerId
                                ) {
                                    game.team1 = newWinner; //ažuriraj novi tim u ovoj utakmici
                                    ChangedTeam = true;
                                    game.predicted_winner_id = undefined; //nemamo više definiranog pobjednika
                                    if (game.team2?.id != undefined)
                                        winnerIds_array.push(game.team2!.id); //ako je definiran, dodajemo drugi tim u array za propagaciju promjena
                                    return {
                                        ...game,
                                    };
                                } else if (
                                    // MIJENJAMO UTAKMICU U KOJOJ JE team2 BIO PRIJAŠNJI POBJEDNIK UPRAVO PROMIJENJENE UTAKMICE
                                    game.team2?.id == previousWinnerId &&
                                    previousWinnerId
                                ) {
                                    game.team2 = newWinner; //ažuriraj novi tim u ovoj utakmici
                                    ChangedTeam = true;
                                    game.predicted_winner_id = undefined; //nemamo više definiranog pobjednika
                                    if (game.team1?.id != undefined)
                                        winnerIds_array.push(game.team1!.id); //ako je definiran, dodajemo drugi tim u array za propagaciju promjena
                                    return {
                                        ...game,
                                    };
                                } else {
                                    // MIJENJAMO UTAKMICU U KOJOJ NEMA PRIJAŠNJEG POBJEDNIKA UPRAVO PROMIJENJENE UTAKMICE
                                    if (!game.team1 && !ChangedTeam) {
                                        //team1 je undefined, tu stavljamo novog pobjednika
                                        game.team1 = newWinner;
                                        ChangedTeam = true;
                                        console.log(
                                            "I just changed something in THIRD ELSE FIRST IF: ",
                                            updatedRounds[i].games
                                        );
                                        return { ...game };
                                    } else if (!game.team2 && !ChangedTeam) {
                                        //team2 je undefined, tu stavljamo novog pobjednika
                                        game.team2 = newWinner;
                                        ChangedTeam = true;
                                        console.log(
                                            "I just changed something in THIRD ELSE SECOND IF: ",
                                            updatedRounds[i].games
                                        );
                                        return { ...game };
                                    }
                                    return { ...game };
                                }
                            }),
                        };
                    } else if (
                        // MIJENJAMO ELIMINACIJSKE FAZE OSIM ONE NEPOSREDNO NAKON
                        updatedRounds[i].roundId <
                        changedRoundIndex - 1
                    ) {
                        updatedRounds[i] = {
                            ...updatedRounds[i],
                            games: updatedRounds[i].games.map((game) => {
                                console.log(
                                    "Elimination games: ",
                                    eliminationGames
                                );
                                if (
                                    //NAIŠLI SMO NA UTAKMICU U KOJOJ TREBAMO PROPAGIRATI PROMJENE IZ RANIJE FAZE
                                    game.team1?.id &&
                                    winnerIds_array.includes(game.team1?.id)
                                ) {
                                    game.team1 = undefined;
                                    game.predicted_winner_id = undefined;
                                    if (game.team2?.id != undefined)
                                        winnerIds_array.push(game.team2.id);
                                    return {
                                        ...game,
                                    };
                                } else if (
                                    //NAIŠLI SMO NA UTAKMICU U KOJOJ TREBAMO PROPAGIRATI PROMJENE IZ RANIJE FAZE
                                    game.team2?.id &&
                                    winnerIds_array.includes(game.team2?.id)
                                ) {
                                    game.team2 = undefined;
                                    game.predicted_winner_id = undefined;
                                    if (game.team1?.id != undefined)
                                        winnerIds_array.push(game.team1.id);
                                    return {
                                        ...game,
                                    };
                                } else {
                                    return { ...game };
                                }
                            }),
                        };
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
            //alert("Prediction saved successfully");
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

                    if (rankings.length >= 2) {
                        teamMap[`${group.groupName}1`] = rankings.find(
                            (r) => r.rank === 1
                        )?.team;
                        teamMap[`${group.groupName}2`] = rankings.find(
                            (r) => r.rank === 2
                        )?.team;
                        //teamMap[`${group.groupName}3`] = rankings.find(
                        //    (r) => r.rank === 3
                        //)?.team;
                        //teamMap[`${group.groupName}4`] = rankings.find(
                        //    (r) => r.rank === 4
                        //)?.team;
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
                        {tournamentStatus == TournamentStatusEnum.Ongoing ? (
                            <></>
                        ) : !groupGamesLock ? (
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
