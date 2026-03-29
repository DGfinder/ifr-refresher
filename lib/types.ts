// ─── IFR Companion — Brain Schema Types ──────────────────────────────────────

export type ContentType =
  | "rule"       // A regulation or requirement
  | "fact"       // A verified fact / quick recall item
  | "procedure"  // A step-by-step procedure
  | "table"      // Tabular data
  | "gotcha"     // Common exam/practical trap
  | "tip"        // Helpful study tip or technique
  | "mnemonic"   // Memory aid
  | "warning"    // Safety-critical note
  | "note";      // General explanatory note

export type VerificationStatus =
  | "verified"   // Cross-checked against source PDF
  | "probable"   // Likely correct but not verified against PDF
  | "unverified" // Source not yet checked — flag for review
  | "flagged";   // Known issue — needs correction

export interface Source {
  label: string;          // e.g. "CASR 61.880", "AIP ENR 1.5 §1.7.2"
  document?: string;      // e.g. "CASR 1998 Vol 2 Compilation 100, Oct 2024"
  section?: string;       // e.g. "§1.7.2"
  page?: string;
  verified: VerificationStatus;
}

export interface ContentItem {
  type: ContentType;
  text: string;
  subItems?: string[];    // For procedures / lists
  source?: Source;
  learnMore?: string;     // Internal link to another topic id
}

export interface TableRow {
  cells: string[];
}

export interface TableContent {
  headers: string[];
  rows: TableRow[];
  source?: Source;
  caption?: string;
}

export interface Topic {
  id: string;
  title: string;
  slug?: string;
  summary?: string;       // 1-2 sentence overview shown in card
  tags?: string[];        // e.g. ["exam", "hofo", "practical"]
  sources?: Source[];     // Primary sources for this topic
  content: ContentItem[];
  tables?: TableContent[];
  relatedTopics?: string[]; // ids of related topics
}

export interface Section {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;           // Lucide icon name
  color: string;          // Tailwind colour name e.g. "indigo", "amber"
  topics: Topic[];
}

export interface Brain {
  version: string;
  lastUpdated: string;    // ISO date
  jurisdiction: string;   // e.g. "CASA Australia"
  sections: Section[];
}
