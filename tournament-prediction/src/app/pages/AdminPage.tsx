import {
    Autocomplete,
    Box,
    Container,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Loading from "../components/General/Loading";

type Country = {
    id: number;
    name: string;
};

type Group = {
    id: number;
    name: string;
};

type Props = {};

const AdminPage = (props: Props) => {
    const [countries, setCountries] = useState<Country[]>();
    const [groups, setGroups] = useState<Group[]>();

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
    }, []);

    const setHomeTeam = (country: Country | null) => {};
    const setAwayTeam = (country: Country | null) => {};

    if (!countries) {
        return <Loading />;
    }

    return (
        <Container
            maxWidth="lg"
            sx={{
                mt: 1,
                display: "flex",
                flexDirection: "column",
                //alignItems: "top",
                justifyContent: "center",
            }}
        >
            {!groups ? (
                <Box>
                    <Typography>Input group names:</Typography>
                    <TextField label="A B C..." variant="outlined" />
                </Box>
            ) : (
                <Box>
                    <Box>
                        <Typography>Home Team:</Typography>
                        <Autocomplete
                            options={countries}
                            getOptionLabel={(option) => option.name}
                            onChange={(event, value) => setHomeTeam(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Country"
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
                            onChange={(event, value) => setAwayTeam(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Country"
                                    variant="outlined"
                                />
                            )}
                        />
                    </Box>
                    <Box>
                        <Typography>Group:</Typography>
                        <Autocomplete
                            options={groups}
                            getOptionLabel={(option) => option.name}
                            onChange={(event, value) => setAwayTeam(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Group"
                                    variant="outlined"
                                />
                            )}
                        />
                    </Box>
                </Box>
            )}
        </Container>
    );
};

export default AdminPage;
