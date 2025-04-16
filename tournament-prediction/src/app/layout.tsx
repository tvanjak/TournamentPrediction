"use client";
import { ThemeProvider } from "@emotion/react";
import Navbar from "./components/Navbar";
import { SessionProvider } from "next-auth/react";
import theme from "./styles/theme";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider theme={theme}>
                    <SessionProvider>
                        <Navbar></Navbar>
                        <main>{children}</main>
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
