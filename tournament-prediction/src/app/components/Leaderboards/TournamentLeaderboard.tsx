import {
    Box,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SecondaryBox from "../General/SecondaryBox";
import Loading from "../General/Loading";
import TablePagination from "@mui/material/TablePagination";

interface LeaderboardUser {
    username: string;
    totalPoints: number;
}

interface TournamentLeaderboardInterface {
    tournamentName: string;
    users: LeaderboardUser[];
}

type Props = {
    tournamentId: number;
};

const TournamentLeaderboard = (props: Props) => {
    /*const [pointsSort, setPointsSort] = useState(true);

    function setPointsTrue() {
        setPointsSort(true);
    }
    function setPointsFalse() {
        setPointsSort(false);
    }*/

    const [leaderboard, setLeaderboard] =
        useState<TournamentLeaderboardInterface>();
    const [paginatedUsers, setPaginatedUsers] = useState<LeaderboardUser[]>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournamentLeaderboard = async () => {
            try {
                console.log("tour: ", props.tournamentId); //delete--------------
                const response = await fetch(
                    `/api/leaderboards/tournamentAll/${props.tournamentId}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch tournament leaderboard");
                }
                const data = await response.json();
                setLeaderboard(data);
            } catch (error) {
                console.error("Error fetching tournament leaderboard: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournamentLeaderboard();
    }, [props.tournamentId]);

    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    useEffect(() => {
        if (leaderboard && leaderboard.users) {
            const temp = leaderboard?.users.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            );
            setPaginatedUsers(temp);
        }
    }, [leaderboard, page, rowsPerPage]);

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

    if (!leaderboard || !paginatedUsers) return null;

    return (
        <Box sx={{ p: 3, width: "450px" }}>
            {/*<SecondaryBox>{leaderboard.tournamentName}</SecondaryBox>*/}
            <SecondaryBox>Full Leaderboard</SecondaryBox>
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
                        {paginatedUsers
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
                count={leaderboard?.users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

export default TournamentLeaderboard;
