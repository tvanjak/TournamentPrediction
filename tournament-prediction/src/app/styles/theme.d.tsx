import { SimplePaletteColorOptions } from "@mui/material";
import { SxProps } from "@mui/system";

declare module "@mui/material/styles" {
    // Extend the Palette interface to add custom colors
    interface Palette {
        accent: SimplePaletteColorOptions;
        textBlack: SimplePaletteColorOptions;
        textWhite: SimplePaletteColorOptions;
        green: SimplePaletteColorOptions;
        lightgreen: SimplePaletteColorOptions;
        red: SimplePaletteColorOptions;
        lightred: SimplePaletteColorOptions;
        lightgray: SimplePaletteColorOptions;
        secondaryHover: SimplePaletteColorOptions;
    }

    interface PaletteOptions {
        accent?: SimplePaletteColorOptions;
        textBlack?: SimplePaletteColorOptions;
        textWhite?: SimplePaletteColorOptions;
        green?: SimplePaletteColorOptions;
        lightgreen?: SimplePaletteColorOptions;
        red?: SimplePaletteColorOptions;
        lightred?: SimplePaletteColorOptions;
        lightgray?: SimplePaletteColorOptions;
        secondaryHover?: SimplePaletteColorOptions;
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
