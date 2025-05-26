import { Container } from "@mui/material";
import React from "react";

type Props = {};

const AdminPage = (props: Props) => {
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
        ></Container>
    );
};

export default AdminPage;
