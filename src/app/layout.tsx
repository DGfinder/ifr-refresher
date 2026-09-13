import type { Metadata, Viewport } from "next";
import { Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ProgramProvider } from "@/features/programs";
import { MainNav } from "@/app-shell/components/MainNav";
import { AppHeader } from "@/app-shell/components/AppHeader";
import { ErrorBoundary } from "@/app-shell/error/ErrorBoundary";
import { ContentDisclaimer } from "@/app-shell/components/ContentDisclaimer";
import { StorageStatusBanner } from "@/app-shell/components/StorageStatusBanner";
import { IFR_THEME } from "@/app-shell/theme/theme";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { Toaster } from "@/shared/ui/toaster";

const interfaceFont = Source_Sans_3({
  variable: "--font-interface",
  subsets: ["latin"],
  display: "swap",
});

const numericFont = IBM_Plex_Mono({
  variable: "--font-numeric",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IFR Quick Study",
  description: "Study IFR law and theory on the go. Offline-ready flashcards and quizzes for instrument-rated pilots.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IFR Quick Study",
  },
  icons: {
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: IFR_THEME.darkTheme,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interfaceFont.variable} ${numericFont.variable} font-sans antialiased bg-[var(--ifr-bg)] text-[var(--ifr-text)]`}
      >
        <ErrorBoundary>
          <ProgramProvider>
            <TooltipProvider delayDuration={200}>
              <div className="min-h-screen pb-24 md:pb-0">
                <AppHeader />
                <StorageStatusBanner />
                <MainNav />
                <main id="main-content">{children}</main>
                <ContentDisclaimer />
              </div>
              <Toaster />
            </TooltipProvider>
          </ProgramProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
