"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Route, ChartNoAxesCombined, TrendingUp } from "lucide-react";
import { VISUAL_LESSONS, visualLessonId } from "../model/geometry";
import { HoldingLesson } from "../components/HoldingLesson";
import { ApproachLesson } from "../components/ApproachLesson";
import { GradientLesson } from "../components/GradientLesson";
import { cn } from "@/shared/lib/cn";

const icons = [Route, ChartNoAxesCombined, TrendingUp];

function PrinciplesContent() {
  const params = useSearchParams();
  const selected = visualLessonId(params.get("lesson"));
  const lesson = VISUAL_LESSONS.find((item) => item.id === selected)!;
  return (
    <div className="workbook-page">
      <p className="eyebrow-accent">Visual workbook</p><h1 className="workbook-title mt-2">Make the principle click.</h1><p className="workbook-lead">Move the controls, follow the geometry, then explain the result in your own words.</p>
      <nav aria-label="Visual lessons" className="my-8 grid gap-3 sm:grid-cols-3">{VISUAL_LESSONS.map((item, i) => { const Icon = icons[i]!; return <Link key={item.id} href={`/principles?lesson=${item.id}`} scroll={false} aria-current={selected === item.id ? "page" : undefined} className={cn("workbook-panel flex min-h-16 items-center gap-3 p-4 font-semibold", selected === item.id && "border-[var(--ifr-accent)] bg-[var(--ifr-accent-soft)] text-[var(--ifr-accent)]")}><Icon size={22} strokeWidth={1.8} aria-hidden="true" />{item.title}</Link>; })}</nav>
      <section className="workbook-panel p-4 sm:p-6 md:p-8" aria-label={lesson.title}>
        <div className="mb-6"><h2 className="text-2xl font-semibold">{lesson.title}</h2><p className="mt-2 text-[var(--ifr-text-muted)]">{lesson.summary}</p></div>
        {selected === "holding" ? <HoldingLesson /> : selected === "approach" ? <ApproachLesson /> : <GradientLesson />}
      </section>
      <Link href={`/study?section=${lesson.section}`} className="workbook-link mt-6 min-h-11">Continue with the source lessons <ArrowRight size={18} aria-hidden="true" /></Link>
    </div>
  );
}

export function PrinciplesScreen() {
  return <Suspense fallback={<div className="workbook-page">Loading visual workbook…</div>}><PrinciplesContent /></Suspense>;
}
