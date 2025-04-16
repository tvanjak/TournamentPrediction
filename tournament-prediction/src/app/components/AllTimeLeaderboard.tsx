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
import InfoBox from "./InfoBox";

type Props = {};

const AllTimeLeaderboard = (props: Props) => {
    const [pointsSort, setPointsSort] = useState(true);

    function setPointsTrue() {
        setPointsSort(true);
    }
    function setPointsFalse() {
        setPointsSort(false);
    }

    const groupsInfo = [
        {
            groupName: "FamilyGroup",
            playersInfo: [
                {
                    username: "Tonino",
                    AvgPoints: 99,
                    TotalPoints: 2341,
                },
                {
                    username: "Marko",
                    AvgPoints: 34,
                    TotalPoints: 3423,
                },
                {
                    username: "Ivan",
                    AvgPoints: 56,
                    TotalPoints: 2313,
                },
                {
                    username: "Pero",
                    AvgPoints: 40,
                    TotalPoints: 1234,
                },
                {
                    username: "La Leyenda",
                    AvgPoints: 79,
                    TotalPoints: 1231,
                },
            ],
        },
        {
            groupName: "RugbyFanatics",
            playersInfo: [
                {
                    username: "Tonino",
                    AvgPoints: 80,
                    TotalPoints: 1241,
                },
                {
                    username: "Marko",
                    AvgPoints: 54,
                    TotalPoints: 4322,
                },
                {
                    username: "Ivan",
                    AvgPoints: 56,
                    TotalPoints: 2341,
                },
                {
                    username: "Pero",
                    AvgPoints: 42,
                    TotalPoints: 1242,
                },
                {
                    username: "La Leyenda",
                    AvgPoints: 99,
                    TotalPoints: 5421,
                },
            ],
        },
    ];

    useEffect(() => {
        async function loadLeaderborad() {
            const res = await fetch("/api/users/leaderboard");
            const data = await res.json();
            console.log(data.users); // [{ userId, username, email, ... }]
        }
    });

    return (
        <Container
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {groupsInfo.map((group, index) => (
                <Box sx={{ p: 3 }} key={index}>
                    <InfoBox>{group.groupName}</InfoBox>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        <Typography>Players</Typography>
                                    </TableCell>
                                    <TableCell
                                        sx={{ textAlign: "center" }}
                                        onClick={setPointsTrue}
                                    >
                                        <Typography>Avg Points</Typography>
                                    </TableCell>
                                    <TableCell
                                        sx={{ textAlign: "center" }}
                                        onClick={setPointsFalse}
                                    >
                                        <Typography>Total Points</Typography>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pointsSort
                                    ? group.playersInfo
                                          .slice() // create a shallow copy so you don't mutate the original
                                          .sort(
                                              (a, b) =>
                                                  b.TotalPoints - a.TotalPoints
                                          ) // sort descending
                                          .map((playerInfo, index) => (
                                              <TableRow key={index}>
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
                                                      {playerInfo.AvgPoints}
                                                  </TableCell>
                                                  <TableCell
                                                      sx={{
                                                          textAlign: "center",
                                                      }}
                                                  >
                                                      {playerInfo.TotalPoints}
                                                  </TableCell>
                                              </TableRow>
                                          ))
                                    : group.playersInfo
                                          .slice() // create a shallow copy so you don't mutate the original
                                          .sort(
                                              (a, b) =>
                                                  b.AvgPoints - a.AvgPoints
                                          ) // sort descending
                                          .map((playerInfo, index) => (
                                              <TableRow key={index}>
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
                                                      {playerInfo.AvgPoints}
                                                  </TableCell>
                                                  <TableCell
                                                      sx={{
                                                          textAlign: "center",
                                                      }}
                                                  >
                                                      {playerInfo.TotalPoints}
                                                  </TableCell>
                                              </TableRow>
                                          ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ))}
        </Container>
    );
};

export default AllTimeLeaderboard;
