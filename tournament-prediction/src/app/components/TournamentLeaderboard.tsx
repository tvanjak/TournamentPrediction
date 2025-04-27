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
import React from "react";

type Props = {};

const TournamentLeaderboard = (props: Props) => {
    const tournamentsInfo = [
        {
            tournamentName: "FIFA 2026 World Cup",
            groupName: "FamilyGroup",
            playersInfo: [
                {
                    username: "Tonino",
                    points: 120,
                },
                {
                    username: "Marko",
                    points: 34,
                },
                {
                    username: "Ivan",
                    points: 56,
                },
                {
                    username: "Pero",
                    points: 40,
                },
                {
                    username: "La Leyenda",
                    points: 79,
                },
            ],
        },
        {
            tournamentName: "2026 Rugby Worl cup",
            groupName: "RugbyFanatics",
            playersInfo: [
                {
                    username: "Tonino",
                    points: 80,
                },
                {
                    username: "Marko",
                    points: 54,
                },
                {
                    username: "Ivan",
                    points: 56,
                },
                {
                    username: "Pero",
                    points: 42,
                },
                {
                    username: "La Leyenda",
                    points: 109,
                },
            ],
        },
    ];

    return (
        <>
            <Container>
                {tournamentsInfo.map((tournament) => (
                    <>
                        <Box>{tournament.tournamentName}</Box>
                        <Box>{tournament.groupName}</Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <Typography>Players</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography>Points</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tournament.playersInfo.map(
                                        (playerInfo) => (
                                            <TableRow>
                                                <TableCell>
                                                    {playerInfo.username}
                                                </TableCell>
                                                <TableCell>
                                                    {playerInfo.points}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                ))}
            </Container>
        </>
    );
};

export default TournamentLeaderboard;
