import type { Metadata } from "next";
import { PrinciplesScreen } from "@/features/principles";

export const metadata: Metadata = { title: "Visual workbook · IFR Quick Study", description: "Interactive training diagrams for holding geometry, approach guidance and climb gradient." };

export default function Page() { return <PrinciplesScreen />; }
