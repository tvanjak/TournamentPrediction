"use client";

import { Button } from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
    const { data: session, status } = useSession();
    const loading = status === "loading";

    if (loading) {
        return (
            <Button color="inherit" disabled>
                Loading...
            </Button>
        );
    }

    if (session) {
        return (
            <Button color="inherit" onClick={() => signOut()}>
                Logout ({session.user?.name})
            </Button>
        );
    }

    return (
        <Button color="inherit" onClick={() => signIn("google")}>
            Login with Google
        </Button>
    );
}
