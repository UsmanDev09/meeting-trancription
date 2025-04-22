import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Provider from "@/components/Provider";
import { SessionProvider } from "next-auth/react";
import { Rubik } from 'next/font/google';
import { ReduxProvider } from "@/redux/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Modern dashboard interface",
};

const rubik = Rubik({ subsets: ['latin'], display: 'swap' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={rubik.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ReduxProvider>
            <Provider>{children}</Provider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
