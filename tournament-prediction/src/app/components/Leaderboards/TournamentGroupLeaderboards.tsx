import {
    Box,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SecondaryBox from "../General/SecondaryBox";
import Loading from "../General/Loading";
import PrimaryBox from "../General/PrimaryBox";

interface LeaderboardUser {
    username: string;
    totalPoints: number;
}

interface GroupLeaderboard {
    groupName: string;
    tournamentName: string;
    users: LeaderboardUser[];
}

type Props = {
    tournamentId: number;
    groupId: number;
};

const TournamentGroupLeaderboard = (props: Props) => {
    /*const [pointsSort, setPointsSort] = useState(true);

    function setPointsTrue() {
        setPointsSort(true);
    }
    function setPointsFalse() {
        setPointsSort(false);
    }*/

    const [groupLeaderboard, setGroupLeaderboard] =
        useState<GroupLeaderboard>();
    const [loading, setLoading] = useState(true);

    const [paginatedUsers, setPaginatedUsers] = useState<LeaderboardUser[]>();

    useEffect(() => {
        async function fetchGroupLeaderboard(
            tournamentId: number,
            groupId: number
        ) {
            try {
                const res = await fetch(
                    `/api/leaderboards/tournamentGroups/${tournamentId}/${groupId}`
                );
                if (!res.ok) {
                    throw new Error("Failed to fetch group leaderboards");
                }
                const data = await res.json();
                console.log(data);
                setGroupLeaderboard(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchGroupLeaderboard(props.tournamentId, props.groupId);
    }, []);

    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);

    useEffect(() => {
        if (groupLeaderboard && groupLeaderboard.users) {
            const temp = groupLeaderboard?.users.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            );
            setPaginatedUsers(temp);
        }
    }, [groupLeaderboard, page, rowsPerPage]);

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ): void => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // reset to first page
    };

    if (loading) return null;

    if (!groupLeaderboard || !groupLeaderboard.users || !paginatedUsers)
        return null;

    return (
        <Box sx={{ p: 3, width: "370px" }}>
            {/*<PrimaryBox>{groupLeaderboard?.tournamentName}</PrimaryBox>*/}
            <SecondaryBox>{groupLeaderboard?.groupName}</SecondaryBox>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontStyle: "italic" }}>
                                    Rank
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontStyle: "italic" }}>
                                    Players
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontStyle: "italic" }}>
                                    Total Points
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groupLeaderboard.users
                            .slice() // create a shallow copy so you don't mutate the original
                            .sort((a, b) => b.totalPoints - a.totalPoints) // sort descending
                            .map((playerInfo, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor:
                                            index % 2 === 0
                                                ? "rgba(0, 0, 0, 0.05)"
                                                : "white",
                                        "&:hover": {
                                            backgroundColor:
                                                "rgba(0, 0, 0, 0.1)",
                                        },
                                    }}
                                >
                                    <TableCell sx={{ textAlign: "center" }}>
                                        {page * rowsPerPage + index + 1}.
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            textAlign: "center",
                                        }}
                                    >
                                        {playerInfo.username}
                                    </TableCell>

                                    <TableCell
                                        sx={{
                                            textAlign: "center",
                                        }}
                                    >
                                        {playerInfo.totalPoints}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={groupLeaderboard?.users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

export default TournamentGroupLeaderboard;
