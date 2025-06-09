"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { Box, Typography } from "@mui/material";
import SecondaryBox from "@/app/components/General/SecondaryBox";

export default function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const [userId, setUserId] = useState();
    const [status, setStatus] = useState<"loading" | "error" | "success">(
        "loading"
    );

    useEffect(() => {
        if (!token || !session?.user) return; // wait for login

        const getUserId = async () => {
            try {
                const response = await fetch(
                    `/api/users/getIdByEmail?email=${session?.user.email}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch user ID");
                }
                const data = await response.json();
                setUserId(data.userId);
            } catch (error) {
                console.error("Error fetching user ID: ", error);
            }
        };
        getUserId();

        const acceptInvite = async () => {
            try {
                await fetch("/api/invite/accept", {
                    method: "POST",
                    body: JSON.stringify({
                        userId: userId,
                        token: token,
                    }),
                });
                setStatus("success");
                // Redirect or show success message
                router.push("/home");
            } catch (err) {
                setStatus("error");
            }
        };

        if (!userId) return;
        acceptInvite();
    }, [session, token, userId]);

    if (!session?.user) {
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
                    <Typography variant="h4">
                        === Please log in to accept the invite ===
                    </Typography>
                </SecondaryBox>
            </Box>
        );
    }

    if (status === "loading")
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
                    <Typography variant="h4">
                        === Accepting your invite... ===
                    </Typography>
                </SecondaryBox>
            </Box>
        );
    if (status === "error")
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
                    <Typography variant="h4">
                        === Invalid or expired invite ===
                    </Typography>
                </SecondaryBox>
            </Box>
        );

    return <p>You're being redirected...</p>;
}
