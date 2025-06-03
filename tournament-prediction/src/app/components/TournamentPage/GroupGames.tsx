"use client";
import { Box, Typography, Paper } from "@mui/material";
import theme from "../../styles/theme";
import { ResultEnum } from "@/types/enums";

interface Team {
    id: number;
    countries?: { name: string };
}

type GroupGamesType = {
    groupName: string;
    games: {
        id: number;
        team1?: { countries?: { name: string } };
        team2?: { countries?: { name: string } };
        result?: ResultEnum;
    }[];
    rankings: {
        rank: number;
        points: number;
        team: Team;
    }[];
};

const GroupGames = ({ groups }: { groups: GroupGamesType[] }) => {
    const getBackgroundColor = (
        result: ResultEnum | undefined,
        team: number
    ): string => {
        if (team == 0) {
            switch (result) {
                case ResultEnum.HomeWin:
                    return theme.palette.green.main;
                case ResultEnum.Draw:
                    return theme.palette.lightgray.main;
                case ResultEnum.AwayWin:
                    return theme.palette.red.main;
                default:
                    return "transparent";
            }
        } else {
            switch (result) {
                case ResultEnum.HomeWin:
                    return theme.palette.red.main;
                case ResultEnum.Draw:
                    return theme.palette.lightgray.main;
                case ResultEnum.AwayWin:
                    return theme.palette.green.main;
                default:
                    return "transparent";
            }
        }
    };

    const mapResult = (result: ResultEnum | undefined) => {
        switch (result) {
            case ResultEnum.HomeWin:
                return "Home Win";
            case ResultEnum.Draw:
                return "Draw";
            case ResultEnum.AwayWin:
                return "Away Win";
            default:
                return null;
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
                                //alignItems="center"
                                height="50px"
                            >
                                <Box sx={{ width: "50%" }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            backgroundColor: getBackgroundColor(
                                                game.result,
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
                                <Box
                                    sx={{
                                        width: "50%",
                                        textAlign: "right",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            backgroundColor: getBackgroundColor(
                                                game.result,
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
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    p: 1,
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    textAlign="center"
                                    sx={{
                                        width: "50%",
                                        border: "1px solid black",
                                        borderRadius: 1,
                                    }}
                                >
                                    {mapResult(game.result) ?? "N/A"}
                                </Typography>
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

export default GroupGames;
