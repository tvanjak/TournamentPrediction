"use client";
import { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Typography,
    Paper,
    Container,
} from "@mui/material";
import AccentBox from "../components/General/AccentBox";
import PrimaryBox from "../components/General/PrimaryBox";

// Types
interface Team {
    id: number;
    name: string;
}

type GroupData = {
    groupName: string;
    games: GroupGame[];
    rankings: {
        rank: number;
        points: number;
        teams: { countries: { name: string } | null } | null;
    }[];
};

interface GroupGame {
    id: number;
    groups?: { name: string };
    team1?: { countries?: { name: string } };
    team2?: { countries?: { name: string } };
    result?: string;
}

// Group Games Section
const GroupGames = ({ groups }: { groups: GroupData[] }) => {
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
                        <Paper key={game.id} sx={{ m: 2 }}>
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                //alignItems="center"
                                height="50px"
                            >
                                <Box sx={{ width: "50%" }}>
                                    <Typography
                                        sx={{
                                            px: 2,
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            height: "100%",
                                            alignContent: "center",
                                        }}
                                    >
                                        {game.team1?.countries?.name ??
                                            "Team 1"}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: "50%",
                                        textAlign: "right",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            px: 2,
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            height: "100%",
                                            alignContent: "center",
                                        }}
                                    >
                                        {game.team2?.countries?.name ??
                                            "Team 2"}
                                    </Typography>
                                </Box>
                                {/* <Box
                                    sx={{
                                        width: "50%",
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            p: 1,
                                            borderRadius: 1,
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            height: "100%",
                                            alignContent: "center",
                                        }}
                                        textAlign="center"
                                    >
                                        {game.team1?.countries?.name ??
                                            "Team 1"}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: "50%",
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            p: 1,
                                            borderRadius: 1,
                                            whiteSpace: "normal",
                                            wordBreak: "break-word",
                                            height: "100%",
                                            alignContent: "center",
                                        }}
                                        textAlign="center"
                                    >
                                        {game.team2?.countries?.name ??
                                            "Team 2"}
                                    </Typography>
                                </Box>*/}
                            </Box>
                            <Typography variant="subtitle1" textAlign="center">
                                {game.result ?? "N/A"}
                            </Typography>
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

interface EliminationGame {
    id: number;
    rounds?: { name: string };
    team1?: { countries?: { name: string } };
    team2?: { countries?: { name: string } };
    team_winner?: { countries?: { name: string } };
    result?: string;
}

// Elimination Games Section
const EliminationGame = ({
    eliminationGames,
}: {
    eliminationGames: { name: string; games: EliminationGame[] }[];
}) => {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            {eliminationGames.map((round, index) => (
                <Box
                    key={index}
                    mb={3}
                    display="flex" // these three lines for vertical centering of elimination titles
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
                                    <Box
                                        sx={{
                                            width: "50%",
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                p: 1,
                                                borderRadius: 1,
                                                backgroundColor:
                                                    game.team1?.countries
                                                        ?.name ===
                                                    game.team_winner?.countries
                                                        ?.name
                                                        ? "lightgreen"
                                                        : "lightcoral",
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                height: "100%",
                                                alignContent: "center",
                                            }}
                                            textAlign="center"
                                        >
                                            {game.team1?.countries?.name ??
                                                "Team 1"}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: "50%",
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                p: 1,
                                                borderRadius: 1,
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                height: "100%",
                                                alignContent: "center",
                                                backgroundColor:
                                                    game.team2?.countries
                                                        ?.name ===
                                                    game.team_winner?.countries
                                                        ?.name
                                                        ? "lightgreen"
                                                        : "lightcoral",
                                            }}
                                            textAlign="center"
                                        >
                                            {game.team2?.countries?.name ??
                                                "Team 2"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            ))}
            <Box mb={3}>
                <Typography variant="h4">Champion: Argentina</Typography>
            </Box>
        </Box>
    );
};

interface Props {
    tournamentId: string;
}

// Main Page Component
const TournamentPage = ({ tournamentId }: Props) => {
    const [loading, setLoading] = useState(true);
    const [groupGames, setGroupGames] = useState<GroupData[]>([]);
    const [eliminationGames, setEliminationGames] = useState<
        { name: string; games: EliminationGame[] }[]
    >([]);
    const [tournamentName, setTournamentName] = useState<string>();

    useEffect(() => {
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
                console.log(groupData);
                console.log(eliminationData);
                console.log(nameData);
                setGroupGames(groupData);
                setEliminationGames(eliminationData);
                setTournamentName(nameData.name);
            } catch (error) {
                console.error("Error fetching tournament data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournamentData();
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
                <EliminationGame eliminationGames={eliminationGames} />
            </Box>
        </Box>
    );
};

export default TournamentPage;
