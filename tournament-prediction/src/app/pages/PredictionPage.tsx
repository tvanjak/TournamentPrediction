"use client";
import { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Typography,
    Paper,
    MenuItem,
    Select,
    SelectChangeEvent,
    Button,
} from "@mui/material";
import AccentBox from "../components/General/AccentBox";
import { useSession } from "next-auth/react";
import { ResultEnum } from "@/types/enums";
import Loading from "../components/General/Loading";
import theme from "../styles/theme";
import CustomTooltip from "../components/General/CustomTooltip";

interface Team {
    id: number;
    countries?: { name: string };
}

type GroupGames = {
    groupName: string;
    games: {
        id: number;
        team1?: Team;
        team2?: Team;
        predicted_result?: ResultEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        team: Team;
    }[];
};

// GroupGamesPrediction Section
const GroupGamesPrediction = ({
    groups,
    onResultChange,
}: {
    groups: GroupGames[];
    onResultChange: (gameId: number, result: ResultEnum) => void;
}) => {
    const getBackgroundColor = (
        result: ResultEnum | undefined,
        team: number
    ): string => {
        if (team == 0) {
            switch (result) {
                case ResultEnum.HomeWin:
                    return "lightgreen";
                case ResultEnum.Draw:
                    return "lightgray";
                case ResultEnum.AwayWin:
                    return "lightcoral";
                default:
                    return "transparent";
            }
        } else {
            switch (result) {
                case ResultEnum.HomeWin:
                    return "lightcoral";
                case ResultEnum.Draw:
                    return "lightgray";
                case ResultEnum.AwayWin:
                    return "lightgreen";
                default:
                    return "transparent";
            }
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="row"
            gap={4}
            overflow="auto"
            flexWrap="wrap"
        >
            {groups.map(({ groupName, games, rankings }) => (
                <Box
                    key={groupName}
                    width={300}
                    sx={{
                        borderLeft: "2px solid black",
                        paddingLeft: 2,
                        borderRadius: 0.5,
                    }}
                >
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            borderBottom: "1px solid black",
                            borderRadius: 0.5,
                        }}
                    >
                        {groupName}
                    </Typography>

                    {games.map((game) => (
                        <Paper key={game.id} sx={{ m: 2, p: 1 }}>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                height="50px"
                            >
                                <Box sx={{ width: "50%" }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            backgroundColor: getBackgroundColor(
                                                game.predicted_result,
                                                0
                                            ),
                                            borderRadius: 2,
                                            m: "2px",
                                            px: 2,
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            height: "100%",
                                            alignContent: "center",
                                            color: theme.palette.textBlack.main,
                                        }}
                                    >
                                        {game.team1?.countries?.name ??
                                            "Team 1"}
                                    </Typography>
                                </Box>
                                <Box sx={{ width: "50%", textAlign: "right" }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            backgroundColor: getBackgroundColor(
                                                game.predicted_result,
                                                1
                                            ),
                                            borderRadius: 2,
                                            m: "2px",
                                            px: 2,
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            height: "100%",
                                            alignContent: "center",
                                            color: theme.palette.textBlack.main,
                                        }}
                                    >
                                        {game.team2?.countries?.name ??
                                            "Team 2"}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box display="flex" justifyContent="center" p={1}>
                                <Select
                                    sx={{ fontSize: 15 }}
                                    value={game.predicted_result ?? ""}
                                    onChange={(
                                        e: SelectChangeEvent<ResultEnum>
                                    ) =>
                                        onResultChange(
                                            game.id,
                                            e.target.value as ResultEnum
                                        )
                                    }
                                    displayEmpty
                                    size="small"
                                    fullWidth
                                    renderValue={(selected) => {
                                        switch (selected) {
                                            case ResultEnum.HomeWin:
                                                return "Home Win";
                                            case ResultEnum.Draw:
                                                return "Draw";
                                            case ResultEnum.AwayWin:
                                                return "Away Win";
                                            default:
                                                return "Select result";
                                        }
                                    }}
                                >
                                    <MenuItem value="">Select result</MenuItem>
                                    <MenuItem value={ResultEnum.HomeWin}>
                                        Home Win
                                    </MenuItem>
                                    <MenuItem value={ResultEnum.Draw}>
                                        Draw
                                    </MenuItem>
                                    <MenuItem value={ResultEnum.AwayWin}>
                                        Away Win
                                    </MenuItem>
                                </Select>
                            </Box>
                        </Paper>
                    ))}

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Group Ranking
                    </Typography>
                    <Box component="table" sx={{ width: "100%", mt: 1 }}>
                        <thead>
                            <tr>
                                <th align="left">#</th>
                                <th align="left">Team</th>
                                <th align="right">Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.rank}.</td>
                                    <td>{r.team?.countries?.name ?? "N/A"}</td>
                                    <td align="right">{r.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

interface EliminationGame {
    id: number;
    rounds?: { name: string };
    team1?: Team | string; // allow placeholders like "A1"
    team2?: Team | string;
    predicted_winner_id?: number;
    predicted_winner?: Team;
}

// Elimination Games with Placeholder Logic
const EliminationGamesPrediction = ({
    eliminationGames,
}: {
    eliminationGames: { name: string; games: EliminationGame[] }[];
}) => {
    const getTeamName = (team: Team | string | undefined) => {
        if (!team) return "TBD";
        if (typeof team === "string") return team;
        return team.countries?.name ?? "TBD";
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            {eliminationGames.map((round, index) => (
                <Box
                    key={index}
                    mb={3}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                >
                    <Typography variant="h6" gutterBottom>
                        {round.name}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                        {round.games.map((game) => (
                            <Box key={game.id} sx={{ m: 2, width: 300 }}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    height="50px"
                                >
                                    <Box sx={{ width: "50%" }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: theme.palette.textBlack
                                                    .main,
                                                m: "2px",
                                                p: 1,
                                                borderRadius: 1,
                                                textAlign: "center",
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                height: "100%",
                                                alignContent: "center",
                                                backgroundColor:
                                                    game.predicted_winner_id &&
                                                    typeof game.team1 !==
                                                        "string" &&
                                                    game.team1?.id ===
                                                        game.predicted_winner_id
                                                        ? "lightgreen"
                                                        : "lightcoral",
                                                "&:hover": {
                                                    backgroundColor:
                                                        game.predicted_winner_id &&
                                                        typeof game.team1 !==
                                                            "string" &&
                                                        game.team1?.id ===
                                                            game.predicted_winner_id
                                                            ? "#3CB371"
                                                            : "#CD5C5C",
                                                    cursor: "pointer",
                                                },
                                                transition:
                                                    "background-color 0.3s ease",
                                            }}
                                        >
                                            {getTeamName(game.team1)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: "50%" }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: theme.palette.textBlack
                                                    .main,
                                                m: "2px",
                                                p: 1,
                                                borderRadius: 1,
                                                textAlign: "center",
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                height: "100%",
                                                alignContent: "center",
                                                backgroundColor:
                                                    game.predicted_winner_id &&
                                                    typeof game.team2 !==
                                                        "string" &&
                                                    game.team2?.id ===
                                                        game.predicted_winner_id
                                                        ? "lightgreen"
                                                        : "lightcoral",
                                                "&:hover": {
                                                    backgroundColor:
                                                        game.predicted_winner_id &&
                                                        typeof game.team2 !==
                                                            "string" &&
                                                        game.team2?.id ===
                                                            game.predicted_winner_id
                                                            ? "#3CB371"
                                                            : "#CD5C5C",
                                                    cursor: "pointer",
                                                },
                                                transition:
                                                    "background-color 0.3s ease",
                                            }}
                                        >
                                            {getTeamName(game.team2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

const PredictionPage = ({ tournamentId }: { tournamentId: number }) => {
    const { data: session } = useSession();
    const [userId, setUserId] = useState(session?.user.email);

    const [predictionId, setPredictionId] = useState<number>();

    const [loading, setLoading] = useState(true);

    const [groupGames, setGroupGames] = useState<GroupGames[]>([]);
    const [eliminationGames, setEliminationGames] = useState<
        { name: string; games: EliminationGame[] }[]
    >([]);
    const [tournamentName, setTournamentName] = useState<string>();

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

    const handleSavePrediction = async () => {
        try {
            await fetch(`/api/predictions/${tournamentId}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupGames, eliminationGames }),
            });
            alert("Prediction saved successfully");
        } catch (err) {
            console.error("Failed to save prediction:", err);
            alert("Failed to save prediction");
        }
    };

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
                const nameData = await nameRes.json();
                setTournamentName(nameData.name);
            } catch (err) {
                console.error("Failed to load prediction:", err);
            } finally {
                setLoading(false);
            }
        };

        if (predictionId && tournamentId) fetchPredictionData();
    }, [predictionId]);

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
            } catch (error) {
                console.log("Error when fetching predictionId: ", error);
            }
        };
        console.log(tournamentId);
        console.log(userId);
        console.log(session?.user.email);
        if (!userId && session?.user.email) fetchUserId();
        if (tournamentId && userId) fetchPredictionId();
    }, [tournamentId, userId, session?.user.email]);

    return (
        <Box>
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
                <AccentBox>{tournamentName} – Prediction</AccentBox>

                <Box mb={4}>
                    <Typography variant="h4" gutterBottom>
                        Group Stage
                    </Typography>
                    <GroupGamesPrediction
                        groups={groupGames}
                        onResultChange={handleGroupResultChange}
                    />
                </Box>

                <Box mt={4}>
                    <Typography variant="h4" gutterBottom>
                        Elimination Stage
                    </Typography>
                    <EliminationGamesPrediction
                        eliminationGames={eliminationGames}
                    />
                </Box>

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
            </Box>
        </Box>
    );
};

export default PredictionPage;
