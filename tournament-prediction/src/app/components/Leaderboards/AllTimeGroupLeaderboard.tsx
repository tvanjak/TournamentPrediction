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

interface User {
    username: string;
    email: string;
    image: string;
    totalPoints: number;
    averagePoints: number;
    tournamentsPlayed: number;
}

interface GroupLeaderboard {
    groupName: string;
    users: User[];
}

type Props = {
    groupId: number;
    onLoaded: () => void;
};

const AllTimeGroupLeaderboard = (props: Props) => {
    const [pointsSort, setPointsSort] = useState(true); //pointsSort - jedan vrijedi za sve prikazane ljestvice

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
                props.onLoaded();
            }
        }
        fetchGroupLeaderboard(props.groupId);
    }, []);

    if (loading) return null;

    if (!groupLeaderboard) return null;

    return (
        <Box
            sx={{
                p: 3,
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!pointsSort
                            ? groupLeaderboard.users
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
                                              {index + 1}.
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
                            : groupLeaderboard.users
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
                                              {index + 1}.
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
        </Box>
    );
};

export default AllTimeGroupLeaderboard;
