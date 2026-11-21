"use client";
import { useState } from "react";
import type { Source } from "@/components/foundations/ArticleParts";
import type { Era, TimelineEvent } from "@/app/vocabulary/foundations/history-of-ai/data";

type Props = {
  events: TimelineEvent[];
  eras: Record<Era, { label: string; span: string }>;
  sources: Source[];
};

export default function Timeline({ events, eras, sources }: Props) {
  const [era, setEra] = useState<Era | "all">("all");
  const shown = era === "all" ? events : events.filter((e) => e.era === era);
  const eraKeys = Object.keys(eras) as Era[];

  return (
    <div>
      <div role="group" aria-label="Filter by era" className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none]">
        {(["all", ...eraKeys] as const).map((k) => {
          const on = era === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setEra(k)}
              aria-pressed={on}
              className={`shrink-0 font-tech text-sm px-4 py-2 rounded-full border transition-colors ${
                on ? "bg-fg text-bg border-fg" : "border-line text-fg/65 hover:text-fg hover:border-fg/40"
              }`}
            >
              {k === "all" ? "All eras" : eras[k].label}
              {k !== "all" && <span className={`ml-2 text-xs ${on ? "text-bg/60" : "text-fg/35"}`}>{eras[k].span}</span>}
            </button>
          );
        })}
      </div>

      <ol className="relative">
        {/* spine */}
        <span className="absolute left-[15px] md:left-1/2 top-2 bottom-2 w-px bg-line md:-translate-x-1/2" aria-hidden="true" />
        {shown.map((e, i) => {
          const right = i % 2 === 1;
          return (
            <li key={`${e.year}-${e.title}`} className="relative pl-12 md:pl-0 pb-8 last:pb-0 md:grid md:grid-cols-2 md:gap-14">
              {/* dot + year */}
              <span
                className="absolute left-[9px] md:left-1/2 top-5 w-[13px] h-[13px] rounded-full bg-bg border-2 border-sage md:-translate-x-1/2"
                aria-hidden="true"
              />
              <div className={`${right ? "md:col-start-2" : "md:col-start-1 md:text-right"}`}>
                <article className="rounded-2xl border border-line bg-card p-5 sm:p-6 text-left hover:border-fg/30 transition-colors">
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <p className="font-tech text-2xl font-bold text-sage tabular-nums">{e.year}</p>
                    <p className="font-tech text-[10px] uppercase tracking-[0.16em] text-fg/40">{eras[e.era].label}</p>
                  </div>
                  <h3 className="font-tech text-lg font-semibold text-fg mb-2 leading-snug">{e.title}</h3>
                  <p className="font-casual text-[15px] text-fg/75 leading-relaxed mb-3">{e.body}</p>
                  <p className="font-casual text-[15px] text-fg leading-relaxed border-t border-line pt-3">
                    <span className="font-tech text-[11px] uppercase tracking-[0.14em] text-sage mr-2">Why it matters</span>
                    {e.why}
                  </p>
                  <p className="mt-3 font-tech text-xs text-fg/45">
                    Source{e.sources.length > 1 ? "s" : ""}:{" "}
                    {e.sources.map((id, j) => {
                      const n = sources.findIndex((s) => s.id === id) + 1;
                      return (
                        <a key={id} href={`#source-${id}`} className="text-sage hover:text-fg">
                          [{n}]{j < e.sources.length - 1 ? " " : ""}
                        </a>
                      );
                    })}
                  </p>
                </article>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
