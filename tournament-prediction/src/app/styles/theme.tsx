// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1ECBE1",
        },
        secondary: {
            main: "#dedcff",
        },
        accent: {
            main: "#433bff", //1EE196
        },
        textBlack: {
            main: "#1C2B36", // Grey for light background
        },
        textWhite: {
            main: "#F1E9DA", // White for dark background
        },
        green: {
            main: "#90EE90", // lightgreen
        },
        lightgreen: {
            main: "#CFF1CF",
        },
        red: {
            main: "#F08080", // lightcoral
        },
        lightred: {
            main: "#FDEEEE",
        },
        lightgray: {
            main: "#D3D3D3",
        },
        secondaryHover: {
            main: "#c8c0f5", // hover over secondary color
        },
        /*text: {
            primary: "#333333", // Dark gray for primary text
            secondary: "#555555", // Medium gray for secondary text
        },*/
        divider: "#e0e0e0", // Light gray for borders or dividers*/
    },
    typography: {
        //fontove treba popravit
        fontFamily: "Rubik, Arial, sans-serif", // Font for the whole theme
        h1: {
            fontWeight: 600,
            color: "#333333",
        },
        h2: {
            fontWeight: 600,
            color: "#333333",
        },
        body1: {
            fontWeight: 400,
            color: "black",
        },
        body2: {
            fontWeight: 400,
            color: "#555555",
        },
    },
    components: {
        MuiButton: {
            variants: [
                {
                    props: { variant: "accentBtn" },
                    style: {
                        mt: 2,
                        backgroundColor: "#FFC300",
                        color: "#003049",
                        fontWeight: "600",
                        "&:hover": {
                            backgroundColor: "#E5A800",
                        },
                    },
                },
            ],
        },
    },
});

export default theme;
