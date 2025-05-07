// AccentBox.tsx
import { Box, BoxProps } from "@mui/material";
import theme from "../../styles/theme";

const PrimaryBox = (props: BoxProps) => {
    return (
        <Box
            sx={{
                fontSize: 20,
                border: "1px solid",
                borderColor: theme.palette.divider,
                borderRadius: 5,
                textAlign: "center",
                padding: 2,
                mx: 2,
                my: 1,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.textBlack.main,
                fontWeight: "550",
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

export default PrimaryBox;
