import { SimplePaletteColorOptions } from "@mui/material";
import { SxProps } from "@mui/system";

declare module "@mui/material/styles" {
    // Extend the Palette interface to add custom colors
    interface Palette {
        accent: SimplePaletteColorOptions;
        textBlack: SimplePaletteColorOptions;
        textWhite: SimplePaletteColorOptions;
        green: SimplePaletteColorOptions;
        red: SimplePaletteColorOptions;
    }

    interface PaletteOptions {
        accent?: SimplePaletteColorOptions;
        textBlack?: SimplePaletteColorOptions;
        textWhite?: SimplePaletteColorOptions;
        green?: SimplePaletteColorOptions;
        red?: SimplePaletteColorOptions;
    }

    interface Theme {
        customBoxes: {
            infoBox: SxProps<Theme>;
            // You can define more variants like:
            // cardBox: SxProps<Theme>;
            // alertBox: SxProps<Theme>;
        };
    }

    interface ThemeOptions {
        customBoxes?: {
            infoBox?: SxProps<Theme>;
            // Define others as optional if needed
        };
    }

    /*interface Theme {
        fontWeights: {
            thin: number;
            extralight: number;
            light: number;
            regular: number;
            medium: number;
            semibold: number;
            bold: number;
            extrabold: number;
            black: number;
        };
    }

    interface ThemeOptions {
        fontWeights?: {
            thin?: number;
            extralight?: number;
            light?: number;
            regular?: number;
            medium?: number;
            semibold?: number;
            bold?: number;
            extrabold?: number;
            black?: number;
        };
    }*/
}

declare module "@mui/material/Button" {
    interface ButtonPropsVariantOverrides {
        accentBtn: true;
        infoBtn: true;
    }
}
