import type { Metadata, Viewport } from "next";
import { Source_Sans_3, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "@/features/baseline/baseline.css";
import { MainNav } from "@/app-shell/components/MainNav";
import { AppHeader } from "@/app-shell/components/AppHeader";
import { ErrorBoundary } from "@/app-shell/error/ErrorBoundary";
import { ContentDisclaimer } from "@/app-shell/components/ContentDisclaimer";
import { IFR_THEME } from "@/app-shell/theme/theme";

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
  description: "Read the Australian IFR Cheat Sheet in its original topic order, with access to the original source pages.",
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
          <div className="min-h-screen">
            <AppHeader />
            <MainNav />
            <main id="main-content" tabIndex={-1}>{children}</main>
            <ContentDisclaimer />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
