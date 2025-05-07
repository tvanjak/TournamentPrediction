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
import TablePagination from "@mui/material/TablePagination";

interface LeaderboardUser {
    username: string;
    totalPoints: number;
    averagePoints: number;
    tournamentsPlayed: number;
}

type Props = {
    onLoaded: () => void;
};

const AllTimeLeaderboard = (props: Props) => {
    const [pointsSort, setPointsSort] = useState(true);

    function setPointsTrue() {
        setPointsSort(true);
    }
    function setPointsFalse() {
        setPointsSort(false);
    }

    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch("/api/leaderboards/all-time");
                if (!response.ok) {
                    throw new Error("Failed to fetch leaderboard");
                }
                const data = await response.json();
                console.log(data.users);
                setUsers(data.users);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
                props.onLoaded();
            }
        };
        fetchLeaderboard();
    }, []);

    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(5);

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

    const paginatedUsers = users.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (loading) return null;

    return (
        <Box sx={{ p: 1 }}>
            <SecondaryBox>All-time leaderboard</SecondaryBox>
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
                            <TableCell
                                onClick={setPointsTrue}
                                sx={{
                                    textAlign: "center",
                                    cursor: "pointer",
                                    backgroundColor: pointsSort
                                        ? "rgba(0, 0, 0, 0.4)"
                                        : "inherit",
                                    color: pointsSort ? "white" : "inherit",
                                    "&:hover": {
                                        backgroundColor: pointsSort
                                            ? "rgba(0, 0, 0, 0.5)"
                                            : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontStyle: "italic",
                                        fontWeight: pointsSort
                                            ? "bold"
                                            : "normal",
                                    }}
                                >
                                    Avg Points
                                </Typography>
                            </TableCell>
                            <TableCell
                                onClick={setPointsFalse}
                                sx={{
                                    textAlign: "center",
                                    cursor: "pointer",
                                    backgroundColor: !pointsSort
                                        ? "rgba(0, 0, 0, 0.4)"
                                        : "inherit",
                                    color: !pointsSort ? "white" : "inherit",
                                    "&:hover": {
                                        backgroundColor: !pointsSort
                                            ? "rgba(0, 0, 0, 0.5)"
                                            : "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontStyle: "italic",
                                        fontWeight: !pointsSort
                                            ? "bold"
                                            : "normal",
                                    }}
                                >
                                    Total Points
                                </Typography>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!pointsSort
                            ? paginatedUsers
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
                                          <TableCell
                                              sx={{ textAlign: "center" }}
                                          >
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
                                              {playerInfo.averagePoints}
                                          </TableCell>
                                          <TableCell
                                              sx={{
                                                  textAlign: "center",
                                              }}
                                          >
                                              {playerInfo.totalPoints}
                                          </TableCell>
                                      </TableRow>
                                  ))
                            : paginatedUsers
                                  .slice() // create a shallow copy so you don't mutate the original
                                  .sort(
                                      (a, b) =>
                                          b.averagePoints - a.averagePoints
                                  ) // sort descending
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
                                          <TableCell
                                              sx={{ textAlign: "center" }}
                                          >
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
                                              {playerInfo.averagePoints}
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
                count={users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

export default AllTimeLeaderboard;
