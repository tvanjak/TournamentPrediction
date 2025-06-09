"use client";

import { Avatar, Button, IconButton, Menu, MenuItem } from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginButton() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const loading = status === "loading";

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleProfile = () => {
        setAnchorEl(null);
        router.push("/profile");
    };
    const handleLogout = () => {
        setAnchorEl(null);
        signOut({ callbackUrl: "/" });
    };

    if (loading) {
        return (
            <Button color="inherit" disabled>
                Loading...
            </Button>
        );
    }

    if (session) {
        return (
            <div>
                <IconButton
                    //sx={{ width: "120px" }}
                    size="medium"
                    onClick={handleMenu}
                    color="inherit"
                >
                    {session.user.image && (
                        <Avatar
                            alt="User Profile"
                            src={session.user.image}
                            sx={{ width: 40, height: 40 }}
                            imgProps={{ referrerPolicy: "no-referrer" }}
                        />
                    )}
                    {!session.user.image && (
                        <AccountCircleIcon fontSize="large" />
                    )}
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleProfile}>Profile</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </div>
        );
    }

    return (
        <Button color="inherit" onClick={() => signIn("google")}>
            Login
        </Button>
    );
}
