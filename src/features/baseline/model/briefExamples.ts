import examples from "./briefExamples.json";

export type BriefExample = {
  parentTopic: string;
  title: string;
  situation: string;
  action: string;
  reason: string;
  sourceUrl: string;
  sourceLabel: string;
};

export const briefExamples: BriefExample[] = examples;
