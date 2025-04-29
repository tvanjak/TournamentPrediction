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
import InfoBox from "../General/InfoBox";
import Loading from "../General/Loading";

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
    groupIds: number[];
};

const AllTimeGroupLeaderboard = (props: Props) => {
    const [pointsSort, setPointsSort] = useState(true);

    function setPointsTrue() {
        setPointsSort(true);
    }
    function setPointsFalse() {
        setPointsSort(false);
    }

    const [groupLeaderboards, setGroupLeaderboards] = useState<
        GroupLeaderboard[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGroupLeaderboards(groupIds: number[]) {
            try {
                const res = await fetch("/api/leaderboards/all-timeGroups", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ groupIds }),
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch group leaderboards");
                }

                const data = await res.json();
                setGroupLeaderboards(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchGroupLeaderboards(props.groupIds);
    }, []);

    if (loading) return <Loading></Loading>;

    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Box
                sx={{
                    p: 3,
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                {groupLeaderboards.map((group, index) => (
                    <Box key={index} sx={{ my: 2, mx: 4 }}>
                        <InfoBox>{group.groupName}</InfoBox>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography
                                                sx={{ fontStyle: "italic" }}
                                            >
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
                                                color: pointsSort
                                                    ? "white"
                                                    : "inherit",
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
                                                color: !pointsSort
                                                    ? "white"
                                                    : "inherit",
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
                                        ? group.users
                                              .slice() // create a shallow copy so you don't mutate the original
                                              .sort(
                                                  (a, b) =>
                                                      b.totalPoints -
                                                      a.totalPoints
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
                                                              textAlign:
                                                                  "center",
                                                          }}
                                                      >
                                                          {playerInfo.username}
                                                      </TableCell>
                                                      <TableCell
                                                          sx={{
                                                              textAlign:
                                                                  "center",
                                                          }}
                                                      >
                                                          {
                                                              playerInfo.averagePoints
                                                          }
                                                      </TableCell>
                                                      <TableCell
                                                          sx={{
                                                              textAlign:
                                                                  "center",
                                                          }}
                                                      >
                                                          {
                                                              playerInfo.totalPoints
                                                          }
                                                      </TableCell>
                                                  </TableRow>
                                              ))
                                        : group.users
                                              .slice() // create a shallow copy so you don't mutate the original
                                              .sort(
                                                  (a, b) =>
                                                      b.averagePoints -
                                                      a.averagePoints
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
                                                              textAlign:
                                                                  "center",
                                                          }}
                                                      >
                                                          {playerInfo.username}
                                                      </TableCell>
                                                      <TableCell
                                                          sx={{
                                                              textAlign:
                                                                  "center",
                                                          }}
                                                      >
                                                          {
                                                              playerInfo.averagePoints
                                                          }
                                                      </TableCell>
                                                      <TableCell
                                                          sx={{
                                                              textAlign:
                                                                  "center",
                                                          }}
                                                      >
                                                          {
                                                              playerInfo.totalPoints
                                                          }
                                                      </TableCell>
                                                  </TableRow>
                                              ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ))}
            </Box>
        </Container>
    );
};

export default AllTimeGroupLeaderboard;
