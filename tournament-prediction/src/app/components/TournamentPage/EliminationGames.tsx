"use client";
import { Box, Typography } from "@mui/material";
import theme from "../../styles/theme";

import { getTeamName } from "@/helpers/Helpers";
import { Team, TournamentEliminationGamesType } from "@/types/types";

const EliminationGames = ({
    eliminationGames,
    adminMode,
    onResultChange,
}: {
    eliminationGames: TournamentEliminationGamesType[];
    adminMode: boolean;
    onResultChange: (
        gameId: number,
        roundId: number,
        newWinner?: Team,
        previousWinnerId?: number
    ) => void;
}) => {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            {eliminationGames
                .sort((a, b) => b.roundId - a.roundId)
                .map((round, index) => (
                    <Box
                        key={index}
                        mb={3}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <Typography variant="h6" gutterBottom>
                            {round.roundName}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                            {round.games.map((game) => (
                                <Box key={game.id} sx={{ m: 2, width: 300 }}>
                                    {adminMode ? (
                                        <Box
                                            display="flex"
                                            justifyContent="space-between"
                                            height="50px"
                                        >
                                            <Box sx={{ width: "50%" }}>
                                                <Typography
                                                    onClick={() =>
                                                        onResultChange(
                                                            game.id,
                                                            round.roundId,
                                                            game.team1,
                                                            game.winner_id
                                                        )
                                                    }
                                                    variant="body2"
                                                    sx={{
                                                        color: theme.palette
                                                            .textBlack.main,
                                                        m: "2px",
                                                        p: 1,
                                                        borderRadius: 1,
                                                        textAlign: "center",
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word",
                                                        height: "100%",
                                                        alignContent: "center",
                                                        backgroundColor:
                                                            game.winner_id &&
                                                            typeof game.team1 !==
                                                                "string" &&
                                                            game.team1?.id ===
                                                                game.winner_id
                                                                ? theme.palette
                                                                      .green
                                                                      .main
                                                                : game.winner_id
                                                                ? theme.palette
                                                                      .red.main
                                                                : theme.palette
                                                                      .lightgray
                                                                      .main,
                                                        "&:hover": {
                                                            backgroundColor:
                                                                !game.winner_id
                                                                    ? "#3CB371"
                                                                    : game.winner_id &&
                                                                      typeof game.team1 !==
                                                                          "string" &&
                                                                      game.team1
                                                                          ?.id ===
                                                                          game.winner_id
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
                                                    onClick={() =>
                                                        onResultChange(
                                                            game.id,
                                                            round.roundId,
                                                            game.team2,
                                                            game.winner_id
                                                        )
                                                    }
                                                    variant="body2"
                                                    sx={{
                                                        color: theme.palette
                                                            .textBlack.main,
                                                        m: "2px",
                                                        p: 1,
                                                        borderRadius: 1,
                                                        textAlign: "center",
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word",
                                                        height: "100%",
                                                        alignContent: "center",
                                                        backgroundColor:
                                                            game.winner_id &&
                                                            typeof game.team2 !==
                                                                "string" &&
                                                            game.team2?.id ===
                                                                game.winner_id
                                                                ? theme.palette
                                                                      .green
                                                                      .main
                                                                : game.winner_id
                                                                ? theme.palette
                                                                      .red.main
                                                                : theme.palette
                                                                      .lightgray
                                                                      .main,
                                                        "&:hover": {
                                                            backgroundColor:
                                                                !game.winner_id
                                                                    ? "#3CB371"
                                                                    : game.winner_id &&
                                                                      typeof game.team2 !==
                                                                          "string" &&
                                                                      game.team2
                                                                          ?.id ===
                                                                          game.winner_id
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
                                    ) : (
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
                                                            game.winner_id &&
                                                            game.team1?.id ===
                                                                game.winner_id
                                                                ? theme.palette
                                                                      .green
                                                                      .main
                                                                : game.winner_id
                                                                ? theme.palette
                                                                      .red.main
                                                                : theme.palette
                                                                      .lightgray
                                                                      .main,
                                                        whiteSpace: "normal",
                                                        wordBreak: "break-word",
                                                        height: "100%",
                                                        alignContent: "center",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {getTeamName(game.team1)}
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
                                                            game.winner_id &&
                                                            game.team2?.id ===
                                                                game.winner_id
                                                                ? theme.palette
                                                                      .green
                                                                      .main
                                                                : game.winner_id
                                                                ? theme.palette
                                                                      .red.main
                                                                : theme.palette
                                                                      .lightgray
                                                                      .main,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {getTeamName(game.team2)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ))}
        </Box>
    );
};

export default EliminationGames;
