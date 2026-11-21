import Link from "next/link";
import { supabase, type Post } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { ArrowIcon } from "@/components/Icons";
import { FOUNDATIONS_PATH, LIVE_TOPICS, TOPICS } from "@/lib/foundations";

export const metadata = {
  title: "AI Vocabulary — Ivaylo Benliyski",
  description: "Plain-language definitions of AI terms and concepts — no jargon walls.",
};

export const revalidate = 60;

async function getEntries(): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("category", "vocabulary")
    .order("title", { ascending: true });
  return data ?? [];
}

export default async function Vocabulary() {
  const entries = await getEntries();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
      <PageHeader
        eyebrow="AI Vocabulary"
        title="The Jargon, Decoded"
        intro="AI moves fast and speaks in acronyms. These are the terms worth actually understanding — explained without the fluff."
      />

      <section className="mb-14" aria-labelledby="foundations-heading">
        <Link
          href={FOUNDATIONS_PATH}
          className="group relative block overflow-hidden rounded-3xl border border-sage/40 bg-card p-7 sm:p-10 hover:border-fg/50 transition-colors"
        >
          <FoundationsArt />
          <div className="relative max-w-xl">
            <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-3">Start here · Foundations</p>
            <h2 id="foundations-heading" className="font-tech text-3xl md:text-4xl font-bold tracking-tight text-fg mb-3">
              What is AI?
            </h2>
            <p className="font-casual text-fg/70 text-lg leading-relaxed mb-6">
              An interactive map of the fundamentals — the history, how machines learn, and the main kinds of models —
              explained in plain language, with sources.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="inline-flex items-center gap-2 font-tech text-sm font-semibold bg-fg text-bg px-5 py-2.5 rounded-full group-hover:bg-white transition-colors">
                Open the map <ArrowIcon size={15} />
              </span>
              <span className="font-tech text-sm text-fg/50">
                {LIVE_TOPICS.length} of {TOPICS.length} topics live
              </span>
            </div>
          </div>
        </Link>
      </section>

      <h2 className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-4">Terms</h2>
      {entries.length === 0 ? (
        <EmptyState message="The first batch of AI terms is being decoded." />
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/vocabulary/${entry.slug}`}
                className="group block h-full bg-card border border-line rounded-2xl p-6 hover:border-fg/40 transition-colors"
              >
                <span className="block font-tech text-lg font-semibold text-fg mb-2">{entry.title}</span>
                {entry.description && (
                  <span className="block font-casual text-sm text-fg/65 leading-relaxed">{entry.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Decorative mini node-map in the corner of the Foundations card. */
function FoundationsArt() {
  return (
    <svg
      viewBox="0 0 320 220"
      className="absolute -right-10 -bottom-8 w-[300px] sm:w-[380px] opacity-30 sm:opacity-50 pointer-events-none"
      aria-hidden="true"
    >
      <g fill="none" stroke="var(--sage)" strokeWidth="1.5">
        <path d="M40 60 C 100 60, 100 120, 160 120" />
        <path d="M40 170 C 100 170, 100 120, 160 120" />
        <path d="M160 120 C 210 120, 210 50, 250 50" strokeDasharray="4 5" />
        <path d="M160 120 C 210 120, 210 190, 250 190" strokeDasharray="4 5" />
        <path d="M250 50 C 285 50, 285 120, 295 120" strokeDasharray="4 5" />
        <path d="M250 190 C 285 190, 285 120, 295 120" strokeDasharray="4 5" />
      </g>
      <g fill="var(--bg)" stroke="var(--fg)" strokeWidth="1.5">
        <circle cx="40" cy="60" r="9" />
        <circle cx="40" cy="170" r="9" fill="var(--sage)" stroke="var(--sage)" />
        <circle cx="160" cy="120" r="11" />
        <circle cx="250" cy="50" r="8" />
        <circle cx="250" cy="190" r="8" />
        <circle cx="295" cy="120" r="8" />
      </g>
    </svg>
  );
}
