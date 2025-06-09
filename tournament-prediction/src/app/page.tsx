"use client";

import { useSession } from "next-auth/react";
import HomePage from "./pages/HomePage";

export default function Home() {
    return <HomePage />;
}
