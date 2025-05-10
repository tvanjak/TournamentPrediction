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

// Types
type ResultEnum = "homeWin" | "draw" | "awayWin";

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
        predicted_result?: ResultEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        teams: { countries: { name: string } } | null;
    }[];
};

interface EliminationGame {
    id: number;
    rounds?: { name: string };
    team1?: Team | string; // allow placeholders like "A1"
    team2?: Team | string;
    predicted_winner_id?: number;
    predicted_winner?: Team;
}

// GroupGamesPrediction Section
const GroupGamesPrediction = ({
    groups,
    onResultChange,
}: {
    groups: GroupData[];
    onResultChange: (gameId: number, value: ResultEnum) => void;
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
                                    value={game.predicted_result ?? ""}
                                    onChange={(e: SelectChangeEvent) =>
                                        onResultChange(
                                            game.id,
                                            e.target.value as ResultEnum
                                        )
                                    }
                                    displayEmpty
                                    size="small"
                                    fullWidth
                                >
                                    <MenuItem value="">Select result</MenuItem>
                                    <MenuItem value="homeWin">
                                        Home Win
                                    </MenuItem>
                                    <MenuItem value="draw">Draw</MenuItem>
                                    <MenuItem value="awayWin">
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
                                    <td>{r.rank}</td>
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
const PredictionPage = ({ tournamentId }: { tournamentId: string }) => {
    const { data: session, status } = useSession();
    const [userId, setUserId] = useState<number>();

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
                    `/api/predictions/${tournamentId}/group-games`
                );
                const groupData = await groupRes.json();
                console.log("groupData: ", groupData);
                setGroupGames(groupData);

                const nameRes = await fetch(
                    `/api/tournaments/${tournamentId}/info`
                );
                const nameData = await nameRes.json();
                setTournamentName(nameData.name);

                const elimRes = await fetch(
                    `/api/predictions/${tournamentId}/elimination-games`
                );
                const elimData = await elimRes.json();
                console.log("elimData: ", elimData);

                setEliminationGames(elimData);
            } catch (err) {
                console.error("Failed to load prediction:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPredictionData();
    }, [tournamentId]);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
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
