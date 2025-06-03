"use client";
import {
    Box,
    Typography,
    Paper,
    MenuItem,
    Select,
    SelectChangeEvent,
    Button,
} from "@mui/material";
import AccentBox from "../General/AccentBox";
import { ResultEnum, StatusEnum, TournamentStatusEnum } from "@/types/enums";
import Loading from "../General/Loading";
import theme from "../../styles/theme";
import CustomTooltip from "../General/CustomTooltip";

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

// GroupGamesPrediction Section
const GroupGamesPrediction = ({
    groupGamesLock,
    tournamentStatus,
    groups,
    onResultChange,
    adjustRankings,
}: {
    groupGamesLock: boolean;
    tournamentStatus: TournamentStatusEnum;
    groups: GroupGames[];
    onResultChange: (gameId: number, result: ResultEnum) => void;
    adjustRankings: (team: Team) => void;
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
                        <Paper
                            key={game.id}
                            sx={{
                                height: 100,
                                m: 2,
                                p: 1,
                                // borderLeft:
                                //     game.status === StatusEnum.Finished
                                //         ? game.points_awarded !== 0
                                //             ? "6px solid lightgreen"
                                //             : "6px solid lightcoral"
                                //         : "6px solid lightgray",
                                // borderRadius: 1,
                                //------------------------------------------------
                                // boxShadow:
                                //     game.status === StatusEnum.Finished
                                //         ? game.points_awarded !== 0
                                //             ? "0 0 5px lightgreen"
                                //             : "0 0 5px lightcoral"
                                //         : "transparent",
                                // border:
                                //     game.status == StatusEnum.Finished
                                //         ? game.points_awarded != 0
                                //             ? "2px solid lightgreen"
                                //             : "2px solid lightcoral"
                                //         : "transparent",
                                // transition: "all 0.3s ease-in-out",
                                //-----------------------------------------------
                                backgroundColor:
                                    game.status === StatusEnum.Finished
                                        ? game.points_awarded !== 0
                                            ? "#CFF1CF"
                                            : "#FDEEEE"
                                        : "transparent",
                            }}
                        >
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
                                {tournamentStatus ==
                                TournamentStatusEnum.Ongoing ? (
                                    <Box
                                        sx={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            mt: 1,
                                        }}
                                    >
                                        {/* <Typography
                                            variant="subtitle1"
                                            sx={{
                                                border: "1px solid black",
                                                borderRadius: 1,
                                                px: 1,
                                                mx: 1,
                                            }}
                                        >
                                            {game.predicted_result ?? "N/A"}
                                        </Typography> */}
                                        <Typography
                                            variant="body1"
                                            textAlign="center"
                                        >
                                            Points earned:{" "}
                                            {game.points_awarded != undefined
                                                ? game.points_awarded
                                                : "N/A"}
                                        </Typography>
                                    </Box>
                                ) : groupGamesLock ? (
                                    <Box
                                        sx={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            mt: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                border: "1px solid black",
                                                borderRadius: 1,
                                                px: 1,
                                                mx: 1,
                                            }}
                                        >
                                            {game.predicted_result ?? "N/A"}
                                        </Typography>
                                    </Box>
                                ) : (
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
                                        <MenuItem value="">
                                            Select result
                                        </MenuItem>
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
                                )}
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
                            {[...rankings] // Copy and sort by rank
                                .sort((a, b) => a.rank - b.rank)
                                .map((r, i, sortedRankings) => {
                                    const canMoveUp =
                                        i > 0 &&
                                        sortedRankings[i].points ===
                                            sortedRankings[i - 1].points &&
                                        r.rank !== 1 &&
                                        r.rank !== 0 &&
                                        tournamentStatus ===
                                            TournamentStatusEnum.Upcoming &&
                                        !groupGamesLock;

                                    return (
                                        <tr key={i}>
                                            <td>{r.rank}.</td>
                                            <td>
                                                {r.team?.countries?.name ??
                                                    "N/A"}
                                            </td>
                                            <td align="right">{r.points}</td>
                                            {canMoveUp && (
                                                <td
                                                    onClick={() =>
                                                        adjustRankings(r.team)
                                                    }
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    ⬆️
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default GroupGamesPrediction;
