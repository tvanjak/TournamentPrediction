"use client";
import { ThemeProvider } from "@emotion/react";
import Navbar from "./components/Header/Navbar";
import { SessionProvider } from "next-auth/react";
import theme from "./styles/theme";
import { Rubik } from "next/font/google";

const rubik = Rubik({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700", "900"], // Add as needed
    variable: "--font-rubik",
    display: "swap",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={rubik.className}>
            <body>
                <ThemeProvider theme={theme}>
                    <SessionProvider>
                        <Navbar />
                        <main>{children}</main>
                    </SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
