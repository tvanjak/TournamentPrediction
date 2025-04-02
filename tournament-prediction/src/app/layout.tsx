import { AuthProvider } from "./components/auth-provider";
import Navbar from "./components/Navbar";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <Navbar></Navbar>
                    <main>{children}</main>
                </AuthProvider>
            </body>
        </html>
    );
}
