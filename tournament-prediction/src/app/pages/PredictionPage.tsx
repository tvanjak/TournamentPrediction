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
import { ResultEnum } from "@/types/enums"; // adjust the import path accordingly
import Loading from "../components/General/Loading";

// Types
//type ResultEnum = "homeWin" | "draw" | "awayWin";

interface Team {
    id: number;
    countries?: { name: string };
}

type GroupData = {
    groupName: string;
    games: {
        id: number;
        team1?: Team;
        team2?: Team;
        result?: ResultEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        teams: { countries: { name: string } } | null;
    }[];
};

// GroupGamesPrediction Section
const GroupGamesPrediction = ({
    groups,
    onResultChange,
}: {
    groups: GroupData[];
    onResultChange: (gameId: number, result: ResultEnum) => void;
}) => {
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
                    minWidth={300}
                    sx={{ borderLeft: "2px solid black", pl: 2 }}
                >
                    <Typography variant="h5" gutterBottom>
                        {groupName}
                    </Typography>

                    {games.map((game) => (
                        <Paper key={game.id} sx={{ m: 2 }}>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                height="50px"
                            >
                                <Typography sx={{ px: 2 }}>
                                    {game.team1?.countries?.name ?? "Team 1"}
                                </Typography>
                                <Typography sx={{ px: 2 }}>
                                    {game.team2?.countries?.name ?? "Team 2"}
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="center" p={1}>
                                <Select
                                    value={game.result ?? ""}
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
                                    <td>{r.teams?.countries?.name ?? "N/A"}</td>
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
                            <Paper key={game.id} sx={{ m: 2, minWidth: 300 }}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    height="50px"
                                >
                                    <Box sx={{ width: "50%" }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
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
                                            }}
                                        >
                                            {getTeamName(game.team1)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: "50%" }}>
                                        <Typography
                                            variant="body1"
                                            sx={{
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
                                            }}
                                        >
                                            {getTeamName(game.team2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

// Main Page
const PredictionPage = ({ tournamentId }: { tournamentId: number }) => {
    const { data: session } = useSession();
    const [userId, setUserId] = useState(session?.user.email);

    const [predictionId, setPredictionId] = useState<number>();

    const [loading, setLoading] = useState(true);
    const [groupGames, setGroupGames] = useState<GroupData[]>([]);
    const [eliminationGames, setEliminationGames] = useState<
        { name: string; games: EliminationGame[] }[]
    >([]);
    const [tournamentName, setTournamentName] = useState<string>();

    const handleGroupResultChange = (gameId: number, value: ResultEnum) => {
        setGroupGames((prevGroups) =>
            prevGroups.map((group) => ({
                ...group,
                games: group.games.map((game) =>
                    game.id === gameId
                        ? { ...game, predicted_result: value }
                        : game
                ),
            }))
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

    if (loading) {
        return <Loading />;
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 3,
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

            <Button
                variant="contained"
                onClick={handleSavePrediction}
                sx={{ position: "absolute", top: 100, right: 50 }}
            >
                Save Prediction
            </Button>
        </Box>
    );
};

export default PredictionPage;
