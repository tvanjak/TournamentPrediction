"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import AccentBox from "../components/General/AccentBox";
import PrimaryBox from "../components/General/PrimaryBox";
import TournamentLeaderboard from "../components/Leaderboards/TournamentLeaderboard";
import TournamentGroupLeaderboard from "../components/Leaderboards/TournamentGroupLeaderboards";
import { useSession } from "next-auth/react";
import Loading from "../components/General/Loading";
import { ResultEnum, StatusEnum } from "@/types/enums";
import CustomTooltip from "../components/General/CustomTooltip";
import { useRouter } from "next/navigation";
import EliminationGames from "../components/TournamentPage/EliminationGames";
import GroupGames from "../components/TournamentPage/GroupGames";
import theme from "../styles/theme";

interface Team {
    id: number;
    countries?: { name: string };
}

type GroupGamesType = {
    groupName: string;
    groupId: number;
    games: {
        id: number;
        team1?: Team;
        team2?: Team;
        result?: ResultEnum;
        status: StatusEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        team: Team;
    }[];
};

type EliminationGamesType = {
    roundName: string;
    roundId: number;
    games: {
        id: number;
        rounds?: { name: string };
        team1?: Team;
        team2?: Team;
        winner_id?: number;
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

interface Props {
    tournamentId: number;
}

const TournamentPage = ({ tournamentId }: Props) => {
    const [loading, setLoading] = useState(true);
    const [groupGames, setGroupGames] = useState<GroupGamesType[]>([]);
    const [groupGamesLock, setGroupGamesLock] = useState(false);
    const [eliminationGames, setEliminationGames] = useState<
        EliminationGamesType[]
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

                const nameRes = await fetch(
                    `/api/tournaments/${tournamentId}/info`
                );
                const infoData = await nameRes.json();
                console.log("INFO: ", infoData);

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

    const handleAdminMode = () => {
        setAdminMode(!adminMode);
    };

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
                    game.id === gameId ? { ...game, result: value } : game
                );

                // Calculate new points per team
                const pointsMap: Record<
                    number,
                    { team: Team; points: number }
                > = {};

                for (const game of updatedGames) {
                    const { team1, team2, result } = game;

                    //if (!team1 || !team2 || !predicted_result) continue;

                    // Initialize teams
                    if (!pointsMap[team1!.id])
                        pointsMap[team1!.id] = { team: team1!, points: 0 };
                    if (!pointsMap[team2!.id])
                        pointsMap[team2!.id] = { team: team2!, points: 0 };

                    // Apply scoring rules--------------------------------------------------------------------------
                    if (result === ResultEnum.HomeWin) {
                        pointsMap[team1!.id].points += pointsSystem!.points_win;
                    } else if (result === ResultEnum.AwayWin) {
                        pointsMap[team2!.id].points += pointsSystem!.points_win;
                    } else if (result === ResultEnum.Draw) {
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
                            clonedGame.winner_id = newWinner?.id;
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
                                ].winner_id = undefined;
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
                                ].winner_id = undefined;
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
                                ].winner_id = undefined;
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
                                ].winner_id = undefined;
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
                    if (!updatedRounds[i].games[0].winner_id) {
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

    const handleRankingsChange = (team: Team) => {
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

    const handleSaveChanges = async () => {
        try {
            //await fetch(`/api/predictions/save`, {
            //    method: "POST",
            //    headers: { "Content-Type": "application/json" },
            //    body: JSON.stringify({
            //        tournamentId,
            //        userId,
            //        groupGames,
            //        eliminationGames,
            //        champion,
            //    }),
            //});
            //alert("Changes saved successfully");
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
                    <GroupGames
                        groupGamesLock={groupGamesLock}
                        groups={groupGames}
                        adminMode={adminMode}
                        onResultChange={handleGroupResultChange}
                        adjustRankings={handleRankingsChange}
                    />
                </Box>

                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>
                        Elimination Stage
                    </Typography>
                    <EliminationGames
                        eliminationGames={eliminationGames}
                        adminMode={adminMode}
                        onResultChange={handleEliminationResultChange}
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
