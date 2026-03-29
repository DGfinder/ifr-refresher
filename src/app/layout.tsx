import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProgramProvider } from "@/contexts/ProgramContext";
import { MainNav } from "@/components/MainNav";
import { AppHeader } from "@/components/AppHeader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IFR Refresher",
  description: "IFR knowledge refresher app",
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
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-[var(--ifr-bg)] text-[var(--ifr-text)]`}
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
