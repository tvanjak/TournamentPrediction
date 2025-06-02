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

interface LeaderboardUser {
    username: string;
    totalPoints: number;
    averagePoints: number;
    tournamentsPlayed: number;
}

interface GroupLeaderboard {
    groupName: string;
    users: LeaderboardUser[];
}

type Props = {
    groupId: number;
    // onLoaded: () => void;
};

const AllTimeGroupLeaderboard = (props: Props) => {
    const [pointsSort, setPointsSort] = useState(true);
    const [paginatedUsers, setPaginatedUsers] = useState<LeaderboardUser[]>();

    function setPointsTrue() {
        setPointsSort(true);
    }
    function setPointsFalse() {
        setPointsSort(false);
    }

    const [groupLeaderboard, setGroupLeaderboard] =
        useState<GroupLeaderboard>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGroupLeaderboard(groupId: number) {
            try {
                const res = await fetch(
                    `/api/leaderboards/all-timeGroup/${groupId}`
                );

                if (!res.ok) {
                    throw new Error("Failed to fetch group leaderboards");
                }

                const data = await res.json();
                setGroupLeaderboard(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchGroupLeaderboard(props.groupId);
    }, []);

    // useEffect(() => {
    //     if (!loading && groupLeaderboard) {
    //         props.onLoaded(); // Call only when truly ready
    //     }
    // }, [loading, groupLeaderboard]);

    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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
        setPage(0);
    };

    if (loading || !groupLeaderboard || !paginatedUsers) return <Loading />;

    return (
        <Box
            sx={{
                p: 3,
                width: "480px",
            }}
        >
            <SecondaryBox>{groupLeaderboard.groupName}</SecondaryBox>
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
                            <TableCell sx={{ textAlign: "center" }}>
                                <Typography sx={{ fontStyle: "italic" }}>
                                    Tournaments played
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
                                              sx={{
                                                  textAlign: "center",
                                              }}
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
                                          <TableCell
                                              sx={{
                                                  textAlign: "center",
                                              }}
                                          >
                                              {playerInfo.tournamentsPlayed}
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
                                              sx={{
                                                  textAlign: "center",
                                              }}
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
                                          <TableCell
                                              sx={{
                                                  textAlign: "center",
                                              }}
                                          >
                                              {playerInfo.tournamentsPlayed}
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

export default AllTimeGroupLeaderboard;
