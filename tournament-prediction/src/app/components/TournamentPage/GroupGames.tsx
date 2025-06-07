"use client";
import {
    Box,
    Typography,
    Paper,
    Select,
    SelectChangeEvent,
    MenuItem,
} from "@mui/material";
import theme from "../../styles/theme";
import { ResultEnum } from "@/types/enums";

import { getTeamName, getBackgroundColor, mapResult } from "@/helpers/Helpers";
import { Team, TournamentGroupGamesType } from "@/types/types";

const GroupGames = ({
    groups,
    adminMode,
    groupGamesLock,
    onResultChange,
    adjustRankings,
}: {
    groups: TournamentGroupGamesType[];
    adminMode: boolean;
    groupGamesLock: boolean;
    onResultChange: (
        gameId: number,
        groupId: number,
        result: ResultEnum
    ) => void;
    adjustRankings: (team: Team) => void;
}) => {
    return (
        <Box
            display="flex"
            flexDirection="row"
            gap={4}
            overflow="auto"
            flexWrap="wrap"
        >
            {groups.map(({ groupName, groupId, games, rankings }) => (
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
                        <Paper key={game.id} sx={{ m: 2, p: 1, height: 100 }}>
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
                                        {getTeamName(game.team1)}
                                    </Typography>
                                </Box>
                                <Box sx={{ width: "50%", textAlign: "right" }}>
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
                                        {getTeamName(game.team2)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box display="flex" justifyContent="center" p={1}>
                                {adminMode ? (
                                    groupGamesLock ? (
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
                                                {mapResult(game.result) ??
                                                    "N/A"}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Select
                                            sx={{ fontSize: 15 }}
                                            value={game.result ?? ""}
                                            onChange={(
                                                e: SelectChangeEvent<ResultEnum>
                                            ) =>
                                                onResultChange(
                                                    game.id,
                                                    groupId,
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
                                            <MenuItem
                                                value={ResultEnum.HomeWin}
                                            >
                                                Home Win
                                            </MenuItem>
                                            <MenuItem value={ResultEnum.Draw}>
                                                Draw
                                            </MenuItem>
                                            <MenuItem
                                                value={ResultEnum.AwayWin}
                                            >
                                                Away Win
                                            </MenuItem>
                                        </Select>
                                    )
                                ) : (
                                    <Box
                                        sx={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            p: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            textAlign="center"
                                            sx={{
                                                border: "1px solid black",
                                                borderRadius: 1,
                                                px: 1,
                                            }}
                                        >
                                            {mapResult(game.result) ?? "N/A"}
                                        </Typography>
                                    </Box>
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
                            {[...rankings] // copy and sort by rank
                                .sort((a, b) => a.rank - b.rank)
                                .map((r, i, sortedRankings) => {
                                    const canMoveUp =
                                        i > 0 &&
                                        sortedRankings[i].points ===
                                            sortedRankings[i - 1].points &&
                                        r.rank !== 1 &&
                                        r.rank !== 0 &&
                                        !groupGamesLock &&
                                        adminMode;

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

export default GroupGames;
