"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowIcon } from "@/components/Icons";
import { CLUSTERS, TOPICS, topicHref, type Cluster, type Topic } from "@/lib/foundations";

const CLUSTER_ORDER: Cluster[] = ["big-picture", "how-it-works", "model-types"];

const EDGES = TOPICS.flatMap((from) =>
  from.leadsTo.map((slug) => ({ from, to: TOPICS.find((t) => t.slug === slug)! })).filter((e) => e.to),
);

/** Soft S-curve between two node centres (map coordinates are percentages). */
function edgePath(a: Topic, b: Topic) {
  const mx = (a.pos.x + b.pos.x) / 2;
  return `M ${a.pos.x} ${a.pos.y} C ${mx} ${a.pos.y}, ${mx} ${b.pos.y}, ${b.pos.x} ${b.pos.y}`;
}

function StatusPill({ topic }: { topic: Topic }) {
  return topic.status === "live" ? (
    <span className="inline-flex items-center gap-1.5 font-tech text-[11px] uppercase tracking-[0.14em] text-sage">
      <span className="w-1.5 h-1.5 rounded-full bg-sage" style={{ animation: "pulseDot 2.4s ease-in-out infinite" }} />
      Read now
    </span>
  ) : (
    <span className="font-tech text-[11px] uppercase tracking-[0.14em] text-fg/40">Coming soon</span>
  );
}

export default function TopicMap() {
  const [activeSlug, setActiveSlug] = useState<string>("history-of-ai");
  const active = TOPICS.find((t) => t.slug === activeSlug) ?? TOPICS[0];
  const isLinked = (slug: string) =>
    slug === active.slug || active.leadsTo.includes(slug) || TOPICS.find((t) => t.slug === slug)?.leadsTo.includes(active.slug);

  return (
    <div>
      {/* ── Desktop: node map ─────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="relative rounded-3xl border border-line bg-card/40 overflow-hidden">
          {/* Cluster columns */}
          <div className="absolute inset-0 grid grid-cols-[30%_30%_40%] pointer-events-none" aria-hidden="true">
            {CLUSTER_ORDER.map((c, i) => (
              <div key={c} className={`pt-6 px-6 ${i > 0 ? "border-l border-dashed border-line" : ""}`}>
                <p className="font-tech text-[11px] text-sage uppercase tracking-[0.18em]">{CLUSTERS[c].label}</p>
              </div>
            ))}
          </div>

          <div className="relative aspect-[2/1]">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {EDGES.map(({ from, to }) => {
                const lit = from.slug === active.slug || to.slug === active.slug;
                return (
                  <path
                    key={`${from.slug}-${to.slug}`}
                    d={edgePath(from, to)}
                    fill="none"
                    stroke={lit ? "var(--sage)" : "var(--line)"}
                    strokeWidth={lit ? 2 : 1.5}
                    strokeDasharray={to.status === "live" || from.status === "live" ? undefined : "5 6"}
                    vectorEffect="non-scaling-stroke"
                    className="transition-[stroke] duration-300"
                  />
                );
              })}
            </svg>

            {TOPICS.map((topic) => {
              const selected = topic.slug === active.slug;
              const dim = !isLinked(topic.slug);
              const className = `absolute -translate-x-1/2 -translate-y-1/2 w-[188px] text-left rounded-2xl border px-4 py-3.5 transition-all duration-300 ${
                selected
                  ? "bg-fg text-bg border-fg shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)] scale-[1.04]"
                  : topic.status === "live"
                    ? "bg-card border-sage/50 text-fg hover:border-fg/60"
                    : "bg-bg border-line text-fg hover:border-fg/40"
              }`;
              const inner = (
                <span className={`block transition-opacity duration-300 ${dim ? "opacity-50" : "opacity-100"}`}>
                  <span className={`block font-tech font-semibold leading-tight mb-1 ${selected ? "text-bg" : "text-fg"}`}>
                    {topic.title}
                  </span>
                  <span className={`block font-casual text-xs leading-snug ${selected ? "text-bg/75" : "text-fg/55"}`}>
                    {topic.tagline}
                  </span>
                </span>
              );
              const handlers = {
                onMouseEnter: () => setActiveSlug(topic.slug),
                onFocus: () => setActiveSlug(topic.slug),
              };
              const style = { left: `${topic.pos.x}%`, top: `${topic.pos.y}%` };
              return topic.status === "live" ? (
                <Link key={topic.slug} href={topicHref(topic.slug)} className={className} style={style} {...handlers}>
                  {inner}
                </Link>
              ) : (
                <button
                  key={topic.slug}
                  type="button"
                  className={className}
                  style={style}
                  {...handlers}
                  onClick={() => setActiveSlug(topic.slug)}
                  aria-label={`${topic.title} — coming soon`}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview panel */}
        <div className="mt-4 rounded-2xl border border-line bg-card p-6 flex items-start justify-between gap-8" aria-live="polite">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <p className="font-tech text-[11px] text-fg/45 uppercase tracking-[0.18em]">{CLUSTERS[active.cluster].label}</p>
              <StatusPill topic={active} />
            </div>
            <p className="font-tech text-2xl font-semibold text-fg mb-2">{active.title}</p>
            <p className="font-casual text-fg/70 leading-relaxed">{active.summary}</p>
          </div>
          {active.status === "live" ? (
            <Link
              href={topicHref(active.slug)}
              className="shrink-0 self-center inline-flex items-center gap-2 font-tech text-sm font-semibold bg-fg text-bg px-5 py-3 rounded-full hover:bg-white transition-colors"
            >
              Read the guide <ArrowIcon size={15} />
            </Link>
          ) : (
            <span className="shrink-0 self-center font-tech text-sm text-fg/45 border border-line px-5 py-3 rounded-full">
              In the works
            </span>
          )}
        </div>
      </div>

      {/* ── Mobile & tablet: stacked path ─────────────────── */}
      <div className="lg:hidden space-y-10">
        {CLUSTER_ORDER.map((c) => (
          <section key={c} aria-labelledby={`cluster-${c}`}>
            <h2 id={`cluster-${c}`} className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-1">
              {CLUSTERS[c].label}
            </h2>
            <p className="font-casual text-sm text-fg/55 mb-4">{CLUSTERS[c].blurb}</p>
            <ol className="relative border-l border-line ml-2 space-y-3">
              {TOPICS.filter((t) => t.cluster === c).map((topic) => {
                const card = (
                  <>
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="font-tech text-lg font-semibold text-fg">{topic.title}</span>
                      {topic.status === "live" && <ArrowIcon size={18} className="shrink-0 text-fg/50" />}
                    </div>
                    <p className="font-casual text-sm text-fg/65 leading-relaxed mb-3">{topic.summary}</p>
                    <StatusPill topic={topic} />
                  </>
                );
                return (
                  <li key={topic.slug} className="relative pl-6">
                    <span
                      className={`absolute -left-[5px] top-6 w-[9px] h-[9px] rounded-full border ${
                        topic.status === "live" ? "bg-sage border-sage" : "bg-bg border-line"
                      }`}
                      aria-hidden="true"
                    />
                    {topic.status === "live" ? (
                      <Link
                        href={topicHref(topic.slug)}
                        className="block rounded-2xl border border-sage/50 bg-card p-5 active:border-fg/60 hover:border-fg/60 transition-colors"
                      >
                        {card}
                      </Link>
                    ) : (
                      <div className="rounded-2xl border border-line bg-bg p-5">{card}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
