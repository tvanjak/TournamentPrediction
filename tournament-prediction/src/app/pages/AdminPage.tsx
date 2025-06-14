"use client";
import {
    Autocomplete,
    Box,
    Button,
    Container,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Loading from "../components/General/Loading";
import { ResultEnum, StatusEnum } from "@/types/enums";
import CustomTooltip from "../components/General/CustomTooltip";
import theme from "../styles/theme";
import { useSession } from "next-auth/react";

type Country = {
    id: number;
    name: string;
};

type Round = {
    id: number;
    name: string;
};

type Sport = {
    id: number;
    name: string;
};

type GroupGame = {
    team1: Country;
    team2: Country;
    group_name: string;
    result: ResultEnum | null;
    status: StatusEnum | null;
};

type GroupRanking = {
    team: Country;
    group_name: string;
    points: number;
    rank: number;
};

type EliminationMatchup = {
    team1: string;
    team2: string;
    round_id: number;
};

const AdminPage = () => {
    const { data: session } = useSession();
    const [countries, setCountries] = useState<Country[]>();
    const [rounds, setRounds] = useState<Round[]>();
    const [sports, setSports] = useState<Sport[]>();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await fetch("/api/getData/getCountries");
                const data = await res.json();
                setCountries(data.countries);
            } catch (error) {
                console.error("Error while fetching countries: ", error);
            }
        };
        const fetchRounds = async () => {
            try {
                const res = await fetch("/api/getData/getRounds");
                const data = await res.json();
                setRounds(data.rounds);
            } catch (error) {
                console.error("Error while fetching rounds: ", error);
            }
        };
        const fetchSports = async () => {
            try {
                const res = await fetch("/api/getData/getSports");
                const data = await res.json();
                setSports(data.sports);
            } catch (error) {
                console.error("Error while fetching sports: ", error);
            }
        };
        fetchCountries();
        fetchRounds();
        fetchSports();
    }, []);

    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const res = await fetch(
                    `/api/users/getIdByEmail?email=${session?.user.email}`
                );
                const data = await res.json();
                setIsAdmin(data.isAdmin);
            } catch (error) {
                console.error("Error while fetching user: ", error);
            }
        };
        if (session?.user.email) fetchAdmin();
    }, [session?.user.email]);

    const [groupGames, setGroupGames] = useState<GroupGame[]>([]);
    const [groupRankings, setGroupRankings] = useState<GroupRanking[]>([]);
    const [eliminationMatchups, setEliminationMatchups] = useState<
        EliminationMatchup[]
    >([]);

    useEffect(() => {
        console.log("Group games: ", groupGames);
        console.log("Group rankings: ", groupRankings);
    }, [groupRankings]);

    const [name, setName] = useState<string>();
    const [nameInput, setNameInput] = useState<string>("");

    const [selectedSport, setSelectedSport] = useState<Sport>();
    const setSportInput = (sport: Sport | null) => {
        if (sport) setSelectedSport(sport);
    };

    const handleInfoInput = () => {
        setName(nameInput);
    };

    const [groups, setGroups] = useState<string[]>([]);
    const [inputFilled, setInputFilled] = useState(false);
    const [groupsInput, setGroupsInput] = useState<string>("");

    const handleGroupsInput = () => {
        groupsInput.split(" ").map((g) => {
            setGroups((prevGroups) => [...prevGroups, g]);
        });
        setInputFilled(true);
    };

    const handleGameInput = () => {
        const newGame = {
            team2: awayTeam!,
            team1: homeTeam!,
            group_name: group!,
            result: null,
            status: null,
        };
        setGroupGames((prevGames) => [...prevGames, newGame]);
        const existsInRankings = (teamId: number, groupName: string) =>
            groupRankings.some(
                (ranking) =>
                    ranking.team.id === teamId &&
                    ranking.group_name === groupName
            );

        if (!existsInRankings(homeTeam!.id, group!)) {
            setGroupRankings((prev) => [
                ...prev,
                {
                    team: homeTeam!,
                    group_name: group!,
                    points: 0,
                    rank: 0,
                },
            ]);
        }

        if (!existsInRankings(awayTeam!.id, group!)) {
            setGroupRankings((prev) => [
                ...prev,
                {
                    team: awayTeam!,
                    group_name: group!,
                    points: 0,
                    rank: 0,
                },
            ]);
        }
    };

    const setH = (country: Country | null) => {
        if (country) setHomeTeam(country);
    };
    const setA = (country: Country | null) => {
        if (country) setAwayTeam(country);
    };
    const setG = (group: string | null) => {
        if (group) setGroup(group);
    };

    const [homeTeam, setHomeTeam] = useState<Country>();
    const [awayTeam, setAwayTeam] = useState<Country>();
    const [group, setGroup] = useState<string>();

    const [team1Input, setTeam1Input] = useState<string>("");
    const [team2Input, setTeam2Input] = useState<string>("");
    const [firstRound, setFirstRound] = useState<Round>();

    const setR = (round: Round | null) => {
        if (round) setFirstRound(round);
    };

    const handleMatchupInput = () => {
        const newMatchup = {
            team1: team1Input,
            team2: team2Input,
            round_id: firstRound!.id,
        };
        setEliminationMatchups((prevMatchups) => [...prevMatchups, newMatchup]);
    };

    const handleTournamentCreate = async () => {
        try {
            await fetch("/api/tournaments/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    selectedSport,
                    groups,
                    groupGames,
                    groupRankings,
                    eliminationMatchups,
                }),
            });
            alert("Tournament created!");
        } catch (error) {
            console.error("Error while creating tournament: ", error);
        }
    };

    // Inside your component's body, before return
    const groupedGames = groupGames.reduce(
        (acc, game) => {
            if (!acc[game.group_name]) {
                acc[game.group_name] = [];
            }
            acc[game.group_name].push(game);
            return acc;
        },
        {} as Record<string, GroupGame[]>
    );

    if (!countries || !rounds || !sports) {
        return <Loading />;
    }

    return (
        <>
            {!isAdmin ? (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100vw",
                        height: "50vh",
                    }}
                >
                    <Typography variant="h4">
                        This page is only accesible to admins!
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        minHeight: "100vh",
                        gap: 2,
                        px: 2,
                    }}
                >
                    <Container
                        maxWidth="xs"
                        sx={{
                            mt: 2,
                            pb: 20,
                            display: "flex",
                            flexDirection: "column",
                            //alignItems: "top",
                            justifyContent: "center",
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="h5">
                                Tournament Info:
                            </Typography>
                            <Box sx={{ ml: 3, width: "300px" }}>
                                <Typography>Name:</Typography>
                                <TextField
                                    placeholder="FIFA World Cup 2002"
                                    variant="outlined"
                                    value={nameInput}
                                    onChange={(e) =>
                                        setNameInput(e.target.value)
                                    }
                                />
                                <Box>
                                    <Typography>Sport:</Typography>
                                    <Autocomplete
                                        options={sports}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(event, value) =>
                                            setSportInput(value)
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select Sport"
                                                variant="outlined"
                                            />
                                        )}
                                    />
                                </Box>
                                <Button
                                    variant="contained"
                                    onClick={handleInfoInput}
                                    sx={{ mt: 1 }}
                                >
                                    Add Tournament Info
                                </Button>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="h5">Create Groups:</Typography>
                            <Box sx={{ ml: 3, width: "300px" }}>
                                <Typography>Group Names:</Typography>
                                <TextField
                                    placeholder="A B C..."
                                    variant="outlined"
                                    value={groupsInput}
                                    onChange={(e) =>
                                        setGroupsInput(e.target.value)
                                    }
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleGroupsInput}
                                    sx={{ mt: 1 }}
                                >
                                    Add Groups
                                </Button>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                opacity: inputFilled ? 1 : 0.4,
                                pointerEvents: inputFilled ? "auto" : "none",
                                transition: "opacity 0.3s ease",
                            }}
                        >
                            <Typography variant="h5">
                                Create Group Games:
                            </Typography>
                            <Box sx={{ ml: 3, width: "300px" }}>
                                <Box>
                                    <Typography>Group:</Typography>
                                    <Autocomplete
                                        options={groups}
                                        getOptionLabel={(option) => option}
                                        onChange={(event, value) => setG(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select Group"
                                                variant="outlined"
                                            />
                                        )}
                                    />
                                </Box>
                                <Box>
                                    <Typography>Home Team:</Typography>
                                    <Autocomplete
                                        options={countries}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(event, value) => setH(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select Country"
                                                variant="outlined"
                                            />
                                        )}
                                    />
                                </Box>
                                <Box>
                                    <Typography>Away Team:</Typography>
                                    <Autocomplete
                                        options={countries}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(event, value) => setA(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select Country"
                                                variant="outlined"
                                            />
                                        )}
                                    />
                                </Box>

                                <Button
                                    variant="contained"
                                    onClick={handleGameInput}
                                    sx={{ mt: 1 }}
                                >
                                    Add Game
                                </Button>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                opacity: inputFilled ? 1 : 0.4,
                                pointerEvents: inputFilled ? "auto" : "none",
                                transition: "opacity 0.3s ease",
                            }}
                        >
                            <Typography variant="h5">
                                Set Up Elimination Matchups:
                            </Typography>
                            <Box sx={{ ml: 3, width: "300px" }}>
                                <Box>
                                    <Typography>
                                        First Elimination Round:
                                    </Typography>
                                    <Autocomplete
                                        options={rounds}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(event, value) => setR(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Select Round"
                                                variant="outlined"
                                            />
                                        )}
                                    />
                                </Box>
                                <Box>
                                    <Typography>Team 1:</Typography>
                                    <TextField
                                        placeholder="A1"
                                        variant="outlined"
                                        value={team1Input}
                                        onChange={(e) =>
                                            setTeam1Input(e.target.value)
                                        }
                                    />
                                    <Typography>Team 2:</Typography>
                                    <TextField
                                        placeholder="B2"
                                        variant="outlined"
                                        value={team2Input}
                                        onChange={(e) =>
                                            setTeam2Input(e.target.value)
                                        }
                                    />
                                </Box>
                                <Button
                                    variant="contained"
                                    onClick={handleMatchupInput}
                                    sx={{ mt: 1 }}
                                >
                                    Add Matchup
                                </Button>
                            </Box>
                        </Box>
                    </Container>
                    <Box
                        sx={{
                            flex: 1, // takes up remaining space
                            mt: 2,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "start",
                            alignItems: "center",
                            backgroundColor: "#f5f5f5", // Optional background
                            borderRadius: 2,
                            p: 2,
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                p: 4,
                                textAlign: "center",
                                mt: 4,
                            }}
                        >
                            <Typography variant="h4">{name}</Typography>
                        </Box>
                        <Box sx={{ width: "100%", px: 4, textAlign: "center" }}>
                            <Typography variant="h5" sx={{ pb: 2 }}>
                                Group Games:
                            </Typography>
                            {groupGames.length == 0 ? (
                                <Box sx={{ height: "200px" }}>
                                    No group games at the moment.
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        minHeight: "200px",
                                        display: "flex",
                                        justifyContent: "space-evenly",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {Object.entries(groupedGames).map(
                                        ([groupName, games]) => (
                                            <Box
                                                key={groupName}
                                                sx={{
                                                    mb: 4,
                                                    minWidth: "250px",
                                                }}
                                            >
                                                <Typography variant="h6">
                                                    Group {groupName}
                                                </Typography>
                                                {games.map((game, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{ py: 1 }}
                                                    >
                                                        <Typography>
                                                            {game.team1.name} vs{" "}
                                                            {game.team2.name}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )
                                    )}
                                </Box>
                            )}
                        </Box>
                        <Box sx={{ width: "100%", px: 4, textAlign: "center" }}>
                            <Typography variant="h5" sx={{ pb: 2 }}>
                                Elimination Matchups:
                            </Typography>
                            {eliminationMatchups.length == 0 ? (
                                <Box sx={{ height: "200px" }}>
                                    No matchups at this moment.
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="h6">
                                        (
                                        {
                                            rounds[
                                                eliminationMatchups[0]
                                                    .round_id - 1
                                            ].name
                                        }
                                        )
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-evenly",
                                            minHeight: "200px",
                                        }}
                                    >
                                        {eliminationMatchups.map(
                                            (matchup, index) => (
                                                <Typography
                                                    variant="h6"
                                                    key={index}
                                                >
                                                    {matchup.team1} vs{" "}
                                                    {matchup.team2}
                                                </Typography>
                                            )
                                        )}
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                    <CustomTooltip title="Confirm tournament creation">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleTournamentCreate}
                            sx={{
                                position: "absolute",
                                top: 100,
                                right: 50,
                            }}
                        >
                            Create Tournament
                        </Button>
                    </CustomTooltip>
                </Box>
            )}
        </>
    );
};

export default AdminPage;
