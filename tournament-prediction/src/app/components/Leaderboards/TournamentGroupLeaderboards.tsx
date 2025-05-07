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
import PrimaryBox from "../General/PrimaryBox";

interface User {
    username: string;
    totalPoints: number;
}

interface GroupLeaderboard {
    groupName: string;
    tournamentName: string;
    users: User[];
}

type Props = {
    tournamentId: number;
    groupId: number;
};

const TournamentGroupLeaderboard = (props: Props) => {
    const [groupLeaderboard, setGroupLeaderboard] =
        useState<GroupLeaderboard>();
    const [loading, setLoading] = useState(true);

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

    if (loading) return <Loading></Loading>;

    if (!groupLeaderboard || !groupLeaderboard.users) return null;

    return (
        <Box sx={{ p: 3 }}>
            <PrimaryBox>{groupLeaderboard?.tournamentName}</PrimaryBox>
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

export default TournamentGroupLeaderboard;
