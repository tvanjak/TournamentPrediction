"use client";
import Navbar from "./components/Navbar";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <SessionProvider>
                    <Navbar></Navbar>
                    <main>{children}</main>
                </SessionProvider>
            </body>
        </html>
    );
}
