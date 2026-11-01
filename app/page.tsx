import Link from "next/link";
import Logo from "@/components/Logo";
import { ArrowIcon, TelegramIcon } from "@/components/Icons";
import { supabase } from "@/lib/supabase";
import { TELEGRAM_DAILY, TELEGRAM_WEEKLY } from "@/lib/links";

export const revalidate = 60;

async function getCounts() {
  const [blog, vocabulary, projects] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true).eq("category", "blog"),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true).eq("category", "vocabulary"),
    supabase.from("projects").select("id", { count: "exact", head: true }),
  ]);
  return {
    blog: blog.count ?? 0,
    vocabulary: vocabulary.count ?? 0,
    projects: projects.count ?? 0,
  };
}

export default async function Home() {
  const counts = await getCounts();

  const sections = [
    {
      href: "/blog",
      label: "Blog",
      title: "AI Trends",
      body: "What's actually happening in AI — and what it means for the industries it's touching.",
      count: counts.blog,
      unit: "post",
    },
    {
      href: "/vocabulary",
      label: "Vocabulary",
      title: "The Jargon, Decoded",
      body: "AI terms explained without the fluff — for curious people, not just engineers.",
      count: counts.vocabulary,
      unit: "term",
    },
    {
      href: "/projects",
      label: "Projects",
      title: "Things I've Built",
      body: "Side projects, experiments, and tools — from AI news digests to whatever's next.",
      count: counts.projects,
      unit: "project",
    },
  ];

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#F3E9D7 1px, transparent 1px), linear-gradient(90deg, #F3E9D7 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 70% at 70% 45%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 70% 45%, black 20%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 50% 60% at 75% 45%, #21463e 0%, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-[1.25fr_1fr] gap-12 md:gap-8 items-center">
          <div className="order-2 md:order-1">
            <p className="inline-flex items-center gap-2.5 font-tech text-xs sm:text-sm text-fg/80 border border-line bg-card/60 rounded-full pl-3 pr-4 py-1.5 mb-7">
              <span className="w-2 h-2 rounded-full bg-sage" style={{ animation: "pulseDot 2.4s ease-in-out infinite" }} />
              Daily AI digest · live on Telegram
            </p>

            <h1 className="font-tech text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl font-bold tracking-tight text-fg mb-6 text-balance">
              AI, without the noise.
            </h1>

            <p className="font-casual text-lg sm:text-xl text-fg/75 leading-relaxed max-w-xl mb-9 text-pretty">
              I&apos;m <span className="text-fg">Ivaylo Benliyski</span>, a product director building with AI in iGaming.
              Every morning I send out the handful of AI stories worth your time — summarised, in plain language.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <a
                href={TELEGRAM_DAILY}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-tech text-base font-semibold bg-fg text-bg px-6 py-3.5 rounded-full hover:bg-white transition-colors"
              >
                <TelegramIcon size={18} />
                Join the daily digest
              </a>
              <a
                href="#digest"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-tech text-base font-semibold border border-fg/30 text-fg px-6 py-3.5 rounded-full hover:border-fg/70 transition-colors"
              >
                Compare daily vs weekly
              </a>
            </div>
          </div>

          <div className="order-1 md:order-2 flex md:justify-center">
            <div className="relative w-24 sm:w-32 md:w-full md:max-w-[360px] aspect-square">
              <div className="hidden md:block absolute inset-[-12%] rounded-full border border-line" />
              <div className="hidden md:block absolute inset-[-26%] rounded-full border border-line/60" />
              <Logo size={360} animate className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Digests ───────── */}
      <section id="digest" className="max-w-6xl mx-auto w-full px-5 sm:px-8 py-20 md:py-28">
        <div className="max-w-2xl mb-12">
          <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-4">Subscribe</p>
          <h2 className="font-tech text-3xl md:text-5xl font-bold tracking-tight text-fg mb-4 text-balance">
            Two ways to keep up.
          </h2>
          <p className="font-casual text-lg text-fg/70 leading-relaxed">
            Free, on Telegram, no sign-up. Pick the pace that suits you — or join both.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Daily — dark card, cream logo */}
          <article className="relative overflow-hidden rounded-3xl border border-line bg-card p-7 sm:p-10 flex flex-col">
            <Logo size={64} />
            <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mt-8 mb-2">Every day · 09:00 Sofia</p>
            <h3 className="font-tech text-2xl sm:text-3xl font-bold text-fg mb-3">Daily AI Digest</h3>
            <p className="font-casual text-fg/75 leading-relaxed mb-8 flex-1">
              The AI stories that matter today, each boiled down to a few lines. Read it with your morning coffee
              and you&apos;re caught up.
            </p>
            <a
              href={TELEGRAM_DAILY}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-2 font-tech text-sm font-semibold bg-fg text-bg px-5 py-3 rounded-full hover:bg-white transition-colors"
            >
              <TelegramIcon size={15} /> Join daily
            </a>
          </article>

          {/* Weekly — cream card, green logo */}
          <article className="relative overflow-hidden rounded-3xl bg-fg p-7 sm:p-10 flex flex-col">
            <Logo size={64} variant="dark" />
            <p className="font-tech text-xs text-bg/60 uppercase tracking-[0.18em] mt-8 mb-2">Every Monday</p>
            <h3 className="font-tech text-2xl sm:text-3xl font-bold text-bg mb-3">Weekly AI Digest</h3>
            <p className="font-casual text-bg/75 leading-relaxed mb-8 flex-1">
              The week&apos;s biggest shifts in one read. For when you want the big picture without a daily ping.
            </p>
            <a
              href={TELEGRAM_WEEKLY}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start inline-flex items-center gap-2 font-tech text-sm font-semibold bg-bg text-fg px-5 py-3 rounded-full hover:bg-card transition-colors"
            >
              <TelegramIcon size={15} /> Join weekly
            </a>
          </article>
        </div>
      </section>

      {/* ───────── Explore ───────── */}
      <section className="border-t border-line">
        <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 py-20 md:py-28">
          <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-4">Explore</p>
          <h2 className="font-tech text-3xl md:text-5xl font-bold tracking-tight text-fg mb-12">On the site</h2>

          <ul className="border-t border-line">
            {sections.map((s) => (
              <li key={s.href} className="border-b border-line">
                <Link href={s.href} className="group grid grid-cols-[1fr_auto] md:grid-cols-[12rem_1fr_auto] gap-x-6 gap-y-1 items-center py-7 md:py-8">
                  <span className="font-tech text-xs uppercase tracking-[0.18em] text-fg/50 md:row-span-1">{s.label}</span>
                  <span className="row-start-2 md:row-start-auto col-start-1 md:col-start-2">
                    <span className="block font-tech text-xl md:text-2xl font-semibold text-fg group-hover:translate-x-1 transition-transform">
                      {s.title}
                    </span>
                    <span className="block font-casual text-fg/65 mt-1 leading-relaxed">{s.body}</span>
                  </span>
                  <span className="row-span-2 md:row-span-1 col-start-2 md:col-start-3 flex items-center gap-4">
                    <span className={`hidden sm:inline font-tech text-xs px-2.5 py-1 rounded-full border ${
                      s.count > 0 ? "border-sage/40 text-sage" : "border-line text-fg/50"
                    }`}>
                      {s.count > 0 ? `${s.count} ${s.unit}${s.count === 1 ? "" : "s"}` : "Coming soon"}
                    </span>
                    <span className="w-10 h-10 rounded-full border border-line flex items-center justify-center text-fg/70 group-hover:bg-fg group-hover:text-bg group-hover:border-fg transition-colors">
                      <ArrowIcon size={16} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Story ───────── */}
      <section className="border-t border-line bg-card/40">
        <div className="max-w-6xl mx-auto w-full px-5 sm:px-8 py-20 md:py-28 grid md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-center">
          <div className="flex justify-center">
            <div className="relative w-48 md:w-72 aspect-square">
              <div className="absolute inset-0 rounded-full border border-fg/25" />
              <div className="absolute inset-[14.6%] border border-fg/25 rotate-45" />
              <Logo size={288} className="relative w-full h-full opacity-90" />
            </div>
          </div>
          <div>
            <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-4">About the logo</p>
            <h2 className="font-tech text-3xl md:text-5xl font-bold tracking-tight text-fg mb-6 text-balance">
              Squaring the circle.
            </h2>
            <p className="font-casual text-lg text-fg/75 leading-relaxed mb-4 text-pretty">
              Build a square with exactly the same area as a circle, using only a compass and straightedge. For two
              thousand years people tried. In 1882 it was proven impossible.
            </p>
            <p className="font-casual text-lg text-fg/75 leading-relaxed mb-8 text-pretty">
              I like it as a metaphor for the problems worth working on: regulation and innovation, human intuition
              and machine intelligence. You know it can&apos;t be perfect. You try regardless.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 font-tech text-sm font-semibold text-fg border-b border-fg/30 hover:border-fg pb-1 transition-colors"
            >
              More about me <ArrowIcon size={14} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
