import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ProgramProvider } from "@/features/programs/context/ProgramContext";
import { MainNav } from "@/app-shell/components/MainNav";
import { AppHeader } from "@/app-shell/components/AppHeader";
import { ErrorBoundary } from "@/app-shell/error/ErrorBoundary";
import { ContentDisclaimer } from "@/app-shell/components/ContentDisclaimer";
import { StorageStatusBanner } from "@/app-shell/components/StorageStatusBanner";
import { IFR_THEME } from "@/app-shell/theme/theme";

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
  title: "IFR Quick Study",
  description: "Study IFR law and theory on the go. Offline-ready flashcards and quizzes for instrument-rated pilots.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IFR Quick Study",
  },
};

export const viewport: Viewport = {
  themeColor: IFR_THEME.darkTheme,
  width: "device-width",
  initialScale: 1,
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
        <ErrorBoundary>
          <ProgramProvider>
            <div className="min-h-screen pb-16 md:pb-0">
              <AppHeader />
              <StorageStatusBanner />
              <MainNav />
              <main>{children}</main>
              <ContentDisclaimer />
            </div>
          </ProgramProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
