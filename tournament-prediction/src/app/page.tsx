"use client";

import { useSession } from "next-auth/react";
import HomePage from "./pages/HomePage";

export default function Home() {
    const { data: session, status } = useSession();
    const loading = status === "loading";

    return <HomePage />;
}
