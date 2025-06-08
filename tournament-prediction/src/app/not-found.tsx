import { Box, Typography } from "@mui/material";
import SecondaryBox from "./components/General/SecondaryBox";

export default function NotFound() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="300px"
            gap={2}
            padding={3}
        >
            <SecondaryBox>
                <Typography variant="h4">=== Page Not Found ===</Typography>
            </SecondaryBox>
        </Box>
    );
}
