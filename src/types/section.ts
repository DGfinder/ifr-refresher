// Content block types
export interface TextBlock {
  type: "text";
  style?: "body";
  text: string;
}

export interface HeadingBlock {
  type: "heading";
  level: 2 | 3;
  text: string;
}

export interface ListBlock {
  type: "list";
  style: "bullet" | "numbered";
  items: string[];
}

export interface QABlock {
  type: "qa";
  question: string;
  answer: string;
}

export interface HierarchyBlock {
  type: "hierarchy";
  items: string[];
}

export interface LawBlock {
  type: "law";
  content: string[];
}

export interface NumbersBlock {
  type: "numbers";
  content: string[];
}

export interface ReferenceBlock {
  type: "reference";
  content: string[];
}

export interface OpsContextBlock {
  type: "ops_context";
  content: string[];
}

export interface TrapsBlock {
  type: "traps";
  content: string[];
}

export interface IpcQuestionsBlock {
  type: "ipc_questions";
  content: string[];
}

export interface AirlineQuestionsBlock {
  type: "airline_questions";
  content: string[];
}

export interface ScenarioBlock {
  type: "scenario";
  content: string[];
}

export type ContentBlock =
  | TextBlock
  | HeadingBlock
  | ListBlock
  | QABlock
  | HierarchyBlock
  | LawBlock
  | NumbersBlock
  | ReferenceBlock
  | OpsContextBlock
  | TrapsBlock
  | IpcQuestionsBlock
  | AirlineQuestionsBlock
  | ScenarioBlock;

export interface Reference {
  source: string;
  part?: string;
  chapter?: string;
  section?: string;
  note?: string;
  url?: string;
}

export interface Module {
  id: string;
  title: string;
  categoryId: string;
  level: "core" | "advanced" | "airline";
  estReadingMinutes: number;
  tags: string[];
  summary: string;
  content: ContentBlock[];
  refs: Reference[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  moduleIds: string[];
}

export interface Section {
  version: string;
  sectionId: string;
  sectionTitle: string;
  sectionDescription: string;
  categories: Category[];
  modules: Module[];
}
