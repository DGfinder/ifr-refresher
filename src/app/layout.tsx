import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ProgramProvider } from "@/contexts/ProgramContext";
import { MainNav } from "@/components/MainNav";
import { AppHeader } from "@/components/AppHeader";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IFR Refresher",
  description: "Study IFR law and theory on the go. Offline-ready flashcards and quizzes for instrument-rated pilots.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IFR Refresher",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${barlowCondensed.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[var(--ifr-bg)] text-[var(--ifr-text)]`}
      >
        <ProgramProvider>
          <div className="min-h-screen pb-16 md:pb-0">
            <AppHeader />
            <MainNav />
            <main>{children}</main>
          </div>
        </ProgramProvider>
      </body>
    </html>
  );
}
