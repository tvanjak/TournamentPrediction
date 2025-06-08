"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function InvitePage({ params }: { params: { token: string } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [userId, setUserId] = useState();
    const [status, setStatus] = useState<"loading" | "error" | "success">(
        "loading"
    );

    useEffect(() => {
        if (!params.token || !session?.user) return; // wait for login

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
                        token: params.token,
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
    }, [session, params.token, userId]);

    if (!session?.user) {
        return <p>Please log in to accept the invite.</p>;
    }

    if (status === "loading") return <p>Accepting your invite...</p>;
    if (status === "error") return <p>Invalid or expired invite.</p>;

    return <p>You're being redirected...</p>;
}
