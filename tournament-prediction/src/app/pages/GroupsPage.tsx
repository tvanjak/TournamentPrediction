"use client";
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Container,
    Typography,
    Autocomplete,
} from "@mui/material";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Loading from "../components/General/Loading";
import CustomTooltip from "../components/General/CustomTooltip";
import { useRouter } from "next/navigation";
import AllTimeGroupLeaderboard from "../components/Leaderboards/AllTimeGroupLeaderboard";
import theme from "../styles/theme";

type userGroup = {
    groupId: number;
    groupName: string;
    createdBy: {
        id: number;
        username: string;
    };
    users: {
        userId: number;
        username: string;
        predictions: {
            id: number;
            tournamentName: string;
        }[];
    }[];
};

const GroupsPage = () => {
    const [userGroups, setUserGroups] = useState<userGroup[]>();
    const [userId, setUserId] = useState<number>();
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [leaderboardsLoaded, setLeaderboardsLoaded] = useState(0);

    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await fetch(
                    `/api/users/getIdByEmail?email=${session?.user.email}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch user ID");
                }
                const data = await response.json();
                setUserId(data.userId);
            } catch (error) {
                console.error("Error fetching user ID: ", error);
            }
        };
        if (session?.user.email) fetchUserId();
    }, [session?.user.email]);

    useEffect(() => {
        const fetchUserGroups = async () => {
            try {
                const res = await fetch(`/api/groups/${userId}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch user groups");
                }
                const data = await res.json();
                console.log("DATA: ", data);
                setUserGroups(data);
            } catch (error) {
                console.error("Error fetching user groups: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (userId) fetchUserGroups();
    }, [userId]);

    useEffect(() => {}, [userGroups]);

    const router = useRouter();
    const viewPrediction = (tournamentId: number, userId: number) => {
        router.push(`/tournament/${tournamentId}/${userId}`);
    };

    const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const [openMember, setOpenMember] = useState(false);
    const [email, setEmail] = useState("");
    const handleOpenMember = () => setOpenMember(true);
    const handleCloseMember = () => setOpenMember(false);
    const handleSubmitMember = () => {
        console.log("Email submitted:", email);
        handleCloseMember();
    };

    const [openGroup, setOpenGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState<string>("");
    const [emails, setEmails] = useState<string[]>([]);
    const handleOpenGroup = () => setOpenGroup(true);
    const handleCloseGroup = () => setOpenGroup(false);
    const handleSubmitGroup = () => {
        console.log("New group name: ", newGroupName);
        console.log("Emails submitted:", emails);
        handleCloseGroup();
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <Container
            maxWidth="lg"
            sx={{
                mt: 3,
                pb: 20,
                display: "flex",
                flexDirection: "column",
                //alignItems: "top",
                justifyContent: "center",
                gap: 2,
            }}
        >
            <Box
                sx={{
                    textAlign: "center",
                    m: 2,
                }}
            >
                <Typography variant="h3">Your groups</Typography>
            </Box>
            <Box
                sx={{
                    gap: 2,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    alignItems: "start",
                }}
            >
                {userGroups?.map((userGroup, index) => (
                    <Box
                        key={index}
                        sx={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <Box
                            sx={{
                                borderLeft: "2px solid black",
                                borderRadius: 0.5,
                                p: 2,
                            }}
                        >
                            <Typography variant="h4">
                                {userGroup.groupName} [creator:{" "}
                                {userGroup.createdBy.username}]
                            </Typography>
                            <Box
                                sx={{
                                    pl: 3,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "start",
                                }}
                            >
                                {userGroup.createdBy.id == userId && (
                                    <CustomTooltip title="Invite another user to group">
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={handleOpenMember}
                                            sx={{ m: 1 }}
                                        >
                                            Add member
                                        </Button>
                                    </CustomTooltip>
                                )}
                                {userGroup.users.map((user, index) => (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            p: 1,
                                        }}
                                        key={index}
                                    >
                                        <Typography
                                            sx={{ fontSize: 22 }}
                                            component="li"
                                        >
                                            {user.username}
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "start",
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            {user.predictions.map(
                                                (prediction) => (
                                                    <CustomTooltip
                                                        key={index}
                                                        title="View prediction"
                                                    >
                                                        <Box
                                                            onClick={() =>
                                                                viewPrediction(
                                                                    prediction.id,
                                                                    user.userId
                                                                )
                                                            }
                                                            sx={{
                                                                borderRadius: 4,
                                                                textAlign:
                                                                    "left",
                                                                padding: 2,
                                                                transition:
                                                                    "background-color 0.3s ease",
                                                                backgroundColor:
                                                                    theme
                                                                        .palette
                                                                        .secondary
                                                                        .main,
                                                                "&:hover": {
                                                                    backgroundColor:
                                                                        "#e0e0e0",
                                                                    cursor: "pointer",
                                                                },
                                                                fontSize: 16,
                                                            }}
                                                        >
                                                            {
                                                                prediction.tournamentName
                                                            }
                                                        </Box>
                                                    </CustomTooltip>
                                                )
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                        <AllTimeGroupLeaderboard groupId={userGroup.groupId} />
                    </Box>
                ))}
            </Box>
            <Dialog open={openMember} onClose={handleCloseMember}>
                <DialogTitle>Enter Email</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Email Address"
                        variant="standard"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMember}>Cancel</Button>
                    <Button onClick={handleSubmitMember} disabled={!email}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
            <CustomTooltip title="Update prediction">
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleOpenGroup}
                    sx={{
                        position: "absolute",
                        top: 100,
                        right: 50,
                        backgroundColor: theme.palette.accent.main,
                        color: theme.palette.textWhite.main,
                    }}
                >
                    Create new group
                </Button>
            </CustomTooltip>
            <Dialog
                open={openGroup}
                onClose={handleCloseGroup}
                maxWidth="md" // options: 'xs', 'sm', 'md', 'lg', 'xl'
                fullWidth
            >
                <DialogTitle>Fill out group info</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex" }}>
                        <TextField
                            placeholder="Group Name"
                            variant="outlined"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                    </Box>
                    <Autocomplete
                        multiple
                        freeSolo
                        options={[]} // no suggestions, or you can provide a list of emails if you want
                        value={emails}
                        onChange={(event, newValue) => {
                            // Filter out invalid emails (optional)
                            const filtered = newValue.filter((email) =>
                                isValidEmail(email)
                            );
                            setEmails(filtered);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                label="Email Addresses"
                                placeholder="Enter email and press enter"
                            />
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseGroup}>Cancel</Button>
                    <Button
                        onClick={handleSubmitGroup}
                        disabled={emails.length == 0}
                    >
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GroupsPage;
