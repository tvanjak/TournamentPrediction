// AccentBox.tsx
import { Box, BoxProps } from "@mui/material";
import theme from "../../styles/theme";

const InfoBox = (props: BoxProps) => {
    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: theme.palette.divider,
                borderRadius: 5,
                textAlign: "center",
                padding: 2,
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.textBlack.main,
                fontWeight: "600",
                transition: "background-color 0.3s ease",
                "&:hover": {
                    //backgroundColor: "#c8c0f5",
                },
                ...props.sx, // allow override
            }}
            {...props}
        />
    );
};

export default InfoBox;
