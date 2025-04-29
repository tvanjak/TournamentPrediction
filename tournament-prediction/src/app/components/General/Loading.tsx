import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Typography } from "@mui/material";

type Props = {};

const Loading = (props: Props) => {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="300px" // You can adjust this if needed
            gap={2} // space between spinner and text
            padding={3}
        >
            <CircularProgress />
            <Typography variant="h6" color="textSecondary">
                Loading...
            </Typography>
        </Box>
    );
};

export default Loading;
