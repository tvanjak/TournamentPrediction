"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type Props = {};

const HomePage = (props: Props) => {
    const { data: session } = useSession();
    return (
        <div>
            {session ? (
                <div>
                    <p>Welcome, {session.user?.name}!</p>
                    <img
                        src={session.user?.image || ""}
                        alt="Profile"
                        width={50}
                        height={50}
                    />
                    <button onClick={() => signOut()}>Sign Out</button>
                </div>
            ) : (
                <button onClick={() => signIn("google")}>
                    Sign In with Google
                </button>
            )}
        </div>
    );
};

export default HomePage;
