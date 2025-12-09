import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gerador de QR Code",
    description: "Gere QR Codes de forma simples, rápida e gratuita.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={cn(inter.className, "min-h-screen bg-background antialiased flex flex-col")}>
                {children}
            </body>
        </html>
    );
}
