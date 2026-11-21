import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon } from "@/components/Icons";
import { FOUNDATIONS_PATH, getTopic, topicHref, topicsLeadingTo } from "@/lib/foundations";

/* Shared building blocks for every Foundations guide. Keep the layout consistent:
   Breadcrumb → ArticleHero → TLDR → sections (with Figures/Callouts) → Takeaways → Sources → KeepGoing */

export type Source = {
  id: string;
  authors: string;
  title: string;
  venue: string;
  year: number;
  url: string;
  /** primary = the original paper/report/announcement; secondary = later analysis or textbook. */
  kind: "primary" | "secondary";
};

export function Breadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 font-tech text-sm text-fg/50">
        <li><Link href="/vocabulary" className="hover:text-fg transition-colors">Vocabulary</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link href={FOUNDATIONS_PATH} className="hover:text-fg transition-colors">Foundations</Link></li>
        <li aria-hidden="true">/</li>
        <li className="text-fg" aria-current="page">{title}</li>
      </ol>
    </nav>
  );
}

export function ArticleHero({
  eyebrow,
  title,
  intro,
  readingMinutes,
  checked,
  art,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  readingMinutes: number;
  /** ISO date the sources were last checked. */
  checked: string;
  art?: ReactNode;
}) {
  const checkedLabel = new Date(checked).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return (
    <header className="relative mb-12 md:mb-16">
      {art}
      <div className="relative">
        <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-4">{eyebrow}</p>
        <h1 className="font-tech text-4xl md:text-6xl font-bold tracking-tight text-fg mb-5 text-balance max-w-3xl">{title}</h1>
        <p className="font-casual text-lg md:text-xl text-fg/70 italic max-w-2xl leading-relaxed text-pretty mb-6">{intro}</p>
        <p className="flex flex-wrap gap-x-5 gap-y-1 font-tech text-xs text-fg/45 uppercase tracking-[0.14em]">
          <span>{readingMinutes} min read</span>
          <span>
            Sources checked <time dateTime={checked}>{checkedLabel}</time>
          </span>
        </p>
      </div>
    </header>
  );
}

export function TLDR({ points }: { points: ReactNode[] }) {
  return (
    <aside className="rounded-3xl border border-sage/40 bg-card p-6 sm:p-8 mb-14" aria-label="Summary">
      <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-4">In 30 seconds</p>
      <ul className="space-y-3">
        {points.map((p, i) => (
          <li key={i} className="flex gap-3 font-casual text-fg/85 leading-relaxed">
            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-sage shrink-0" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function Section({ id, kicker, title, children }: { id: string; kicker?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mb-16 md:mb-20 scroll-mt-24">
      {kicker && <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-3">{kicker}</p>}
      <h2 id={`${id}-h`} className="font-tech text-2xl md:text-4xl font-bold tracking-tight text-fg mb-6 text-balance">
        {title}
      </h2>
      <div className="space-y-5 font-casual text-[17px] md:text-lg text-fg/80 leading-relaxed [&_strong]:text-fg [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}

export function Figure({ caption, children, wide }: { caption: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <figure className={`my-10 ${wide ? "" : "max-w-3xl"}`}>
      <div className="rounded-3xl border border-line bg-card/60 p-4 sm:p-6 overflow-hidden">{children}</div>
      <figcaption className="mt-3 font-tech text-xs text-fg/50 leading-relaxed">{caption}</figcaption>
    </figure>
  );
}

export function Callout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border-l-2 border-sage bg-card px-5 py-4 not-italic">
      <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-2">{label}</p>
      <div className="font-casual text-fg/80 leading-relaxed">{children}</div>
    </div>
  );
}

/** Inline citation: renders [n] linking to the matching entry in <Sources>. */
export function Cite({ ids, sources }: { ids: string[]; sources: Source[] }) {
  return (
    <sup className="font-tech text-[0.65em] ml-0.5 whitespace-nowrap">
      {ids.map((id, i) => {
        const n = sources.findIndex((s) => s.id === id) + 1;
        if (n === 0) throw new Error(`Unknown source "${id}"`);
        return (
          <a key={id} href={`#source-${id}`} className="text-sage hover:text-fg" aria-label={`Source ${n}`}>
            {i === 0 ? "[" : ""}
            {n}
            {i === ids.length - 1 ? "]" : ","}
          </a>
        );
      })}
    </sup>
  );
}

export function Takeaways({ items }: { items: ReactNode[] }) {
  return (
    <section aria-labelledby="takeaways-h" className="mb-16">
      <h2 id="takeaways-h" className="font-tech text-2xl md:text-3xl font-bold tracking-tight text-fg mb-6">Key takeaways</h2>
      <ul className="grid sm:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <li key={i} className="rounded-2xl border border-line bg-card p-5 font-casual text-fg/80 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Sources({ sources }: { sources: Source[] }) {
  return (
    <section id="sources" aria-labelledby="sources-h" className="mb-16 scroll-mt-24">
      <h2 id="sources-h" className="font-tech text-2xl md:text-3xl font-bold tracking-tight text-fg mb-2">Sources</h2>
      <p className="font-casual text-fg/55 mb-6">
        Original papers and announcements are marked <span className="text-sage">primary</span>; later analyses and
        textbooks are <span className="text-fg/70">secondary</span>.
      </p>
      <ol className="space-y-3">
        {sources.map((s, i) => (
          <li key={s.id} id={`source-${s.id}`} className="flex gap-4 scroll-mt-24 target:bg-card rounded-xl p-2 -m-2">
            <span className="font-tech text-sm text-fg/40 w-6 shrink-0 text-right">{i + 1}</span>
            <div className="min-w-0 font-casual text-[15px] text-fg/75 leading-relaxed">
              {s.authors} ({s.year}).{" "}
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg break-words">
                {s.title}
              </a>
              . <span className="italic">{s.venue}</span>.{" "}
              <span className={`font-tech text-[10px] uppercase tracking-[0.14em] ${s.kind === "primary" ? "text-sage" : "text-fg/45"}`}>
                {s.kind}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** "Keep going" — the next topics on the map, plus where you came from. */
export function KeepGoing({ slug }: { slug: string }) {
  const topic = getTopic(slug);
  if (!topic) return null;
  const next = topic.leadsTo.map(getTopic).filter((t) => t !== undefined);
  const prev = topicsLeadingTo(slug);
  const cards = [...next.map((t) => ({ t, rel: "Up next" })), ...prev.map((t) => ({ t, rel: "Comes before" }))];

  return (
    <section aria-labelledby="keep-going-h" className="border-t border-line pt-12">
      <h2 id="keep-going-h" className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-5">Keep going</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map(({ t, rel }) => {
          const body = (
            <>
              <span className="block font-tech text-[11px] text-fg/45 uppercase tracking-[0.14em] mb-2">
                {rel} · {t.status === "live" ? "Read now" : "Coming soon"}
              </span>
              <span className="block font-tech text-lg font-semibold text-fg mb-1">{t.title}</span>
              <span className="block font-casual text-sm text-fg/60">{t.tagline}</span>
            </>
          );
          return t.status === "live" ? (
            <Link key={t.slug} href={topicHref(t.slug)} className="block rounded-2xl border border-sage/40 bg-card p-5 hover:border-fg/50 transition-colors">
              {body}
            </Link>
          ) : (
            <div key={t.slug} className="rounded-2xl border border-line p-5">{body}</div>
          );
        })}
        <Link
          href={FOUNDATIONS_PATH}
          className="group flex items-center justify-between gap-4 rounded-2xl bg-fg text-bg p-5 hover:bg-white transition-colors"
        >
          <span>
            <span className="block font-tech text-[11px] text-bg/60 uppercase tracking-[0.14em] mb-2">Foundations</span>
            <span className="block font-tech text-lg font-semibold">Back to the map</span>
          </span>
          <ArrowIcon size={20} />
        </Link>
      </div>
    </section>
  );
}

export function OnThisPage({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="On this page" className="hidden xl:block sticky top-28">
      <p className="font-tech text-[11px] text-fg/45 uppercase tracking-[0.18em] mb-3">On this page</p>
      <ul className="space-y-2 border-l border-line">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="block -ml-px pl-4 border-l border-transparent font-tech text-sm text-fg/55 hover:text-fg hover:border-fg transition-colors">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
