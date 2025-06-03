"use client";
import { Box, Typography } from "@mui/material";
import theme from "../../styles/theme";

interface Team {
    id: number;
    countries?: { name: string };
}

interface EliminationGameType {
    id: number;
    rounds?: { name: string };
    team1?: { countries?: { name: string } };
    team2?: { countries?: { name: string } };
    team_winner?: { countries?: { name: string } };
    result?: string;
}

// Elimination Games Section
const EliminationGames = ({
    eliminationGames,
}: {
    eliminationGames: { name: string; games: EliminationGameType[] }[];
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
                            <Box key={game.id} sx={{ m: 2, width: 300 }}>
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
                                                m: "2px",
                                                p: 1,
                                                borderRadius: 1,
                                                backgroundColor:
                                                    game.team_winner &&
                                                    game.team1?.countries
                                                        ?.name ===
                                                        game.team_winner
                                                            ?.countries?.name
                                                        ? theme.palette.green
                                                              .main
                                                        : game.team_winner
                                                        ? theme.palette.red.main
                                                        : theme.palette
                                                              .lightgray.main,
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                height: "100%",
                                                alignContent: "center",
                                                textAlign: "center",
                                            }}
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
                                                m: "2px",
                                                p: 1,
                                                borderRadius: 1,
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                                height: "100%",
                                                alignContent: "center",
                                                backgroundColor:
                                                    game.team_winner &&
                                                    game.team2?.countries
                                                        ?.name ===
                                                        game.team_winner
                                                            ?.countries?.name
                                                        ? theme.palette.green
                                                              .main
                                                        : game.team_winner
                                                        ? theme.palette.red.main
                                                        : theme.palette
                                                              .lightgray.main,
                                                textAlign: "center",
                                            }}
                                        >
                                            {game.team2?.countries?.name ??
                                                "Team 2"}
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

export default EliminationGames;
