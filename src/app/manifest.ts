import type { MetadataRoute } from "next";
import { IFR_THEME } from "@/app-shell/theme/theme";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IFR Quick Study",
    short_name: "IFR QS",
    description: "Study IFR law and theory on the go. Offline-ready flashcards and quizzes for instrument-rated pilots.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: IFR_THEME.lightBackground,
    theme_color: IFR_THEME.lightTheme,
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
