import { notFound } from "next/navigation";
import { BaselineReader } from "@/features/baseline/components/BaselineReader";
import { baselineTopics, findBaselineTopic } from "@/features/baseline/model/baseline";

export const dynamicParams = false;
export function generateStaticParams() { return baselineTopics.map(({ id }) => ({ topic: id })); }
export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const entry = findBaselineTopic((await params).topic);
  return { title: entry ? `${entry.title} · IFR Quick Study` : "Topic not found" };
}
export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const topic = findBaselineTopic((await params).topic);
  if (!topic) notFound();
  return <BaselineReader topic={topic} />;
}
