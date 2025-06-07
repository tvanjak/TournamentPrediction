"use client";
import { Box, Typography } from "@mui/material";
import { StatusEnum, TournamentStatusEnum } from "@/types/enums";
import theme from "../../styles/theme";

interface Team {
    id: number;
    countries?: { name: string };
}

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

const EliminationGamesPrediction = ({
    tournamentStatus,
    eliminationGames,
    onResultChange,
}: {
    tournamentStatus: TournamentStatusEnum;
    eliminationGames: EliminationGames[];
    onResultChange: (
        gameId: number,
        roundId: number,
        newWinner?: Team,
        previousWinnerId?: number
    ) => void;
}) => {
    const getTeamName = (team: Team | string | undefined) => {
        if (!team) return "TBD";
        if (typeof team === "string") return team;
        return team.countries?.name ?? "TBD";
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
            {eliminationGames.map((rounds, index) => (
                <Box
                    key={index}
                    mb={3}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                >
                    <Typography variant="h6" gutterBottom>
                        {rounds.roundName}
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            justifyContent: "center",
                        }}
                    >
                        {rounds.games.map((game) => (
                            <Box key={game.id} sx={{ m: 2, width: 300 }}>
                                {tournamentStatus ==
                                TournamentStatusEnum.Upcoming ? (
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
                                                        rounds.roundId,
                                                        game.team1,
                                                        game.predicted_winner_id
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
                                                        game.predicted_winner_id &&
                                                        typeof game.team1 !==
                                                            "string" &&
                                                        game.team1?.id ===
                                                            game.predicted_winner_id
                                                            ? theme.palette
                                                                  .green.main
                                                            : game.predicted_winner_id
                                                            ? theme.palette.red
                                                                  .main
                                                            : theme.palette
                                                                  .lightgray
                                                                  .main,
                                                    "&:hover": {
                                                        backgroundColor:
                                                            !game.predicted_winner_id
                                                                ? "#3CB371"
                                                                : game.predicted_winner_id &&
                                                                  typeof game.team1 !==
                                                                      "string" &&
                                                                  game.team1
                                                                      ?.id ===
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
                                                onClick={() =>
                                                    onResultChange(
                                                        game.id,
                                                        rounds.roundId,
                                                        game.team2,
                                                        game.predicted_winner_id
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
                                                        game.predicted_winner_id &&
                                                        typeof game.team2 !==
                                                            "string" &&
                                                        game.team2?.id ===
                                                            game.predicted_winner_id
                                                            ? theme.palette
                                                                  .green.main
                                                            : game.predicted_winner_id
                                                            ? theme.palette.red
                                                                  .main
                                                            : theme.palette
                                                                  .lightgray
                                                                  .main,
                                                    "&:hover": {
                                                        backgroundColor:
                                                            !game.predicted_winner_id
                                                                ? "#3CB371"
                                                                : game.predicted_winner_id &&
                                                                  typeof game.team2 !==
                                                                      "string" &&
                                                                  game.team2
                                                                      ?.id ===
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
                                ) : (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            height: "100px",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                height: "50px",
                                            }}
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
                                                            game.predicted_winner_id &&
                                                            game.team1?.id ===
                                                                game.predicted_winner_id
                                                                ? theme.palette
                                                                      .green
                                                                      .main
                                                                : game.predicted_winner_id
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
                                                            game.predicted_winner_id &&
                                                            game.team2?.id ===
                                                                game.predicted_winner_id
                                                                ? theme.palette
                                                                      .green
                                                                      .main
                                                                : game.predicted_winner_id
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
                                        <Typography
                                            sx={{
                                                textAlign: "center",
                                                fontStyle: "italic",
                                            }}
                                        >
                                            Points awarded:{" "}
                                            {game.points_awarded != undefined
                                                ? game.points_awarded
                                                : "N/A"}
                                        </Typography>
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

export default EliminationGamesPrediction;
