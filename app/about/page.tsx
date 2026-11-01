import Link from "next/link";
import Logo from "@/components/Logo";
import { LinkedInIcon, MailIcon, TelegramIcon } from "@/components/Icons";
import { EMAIL, LINKEDIN, TELEGRAM_DAILY } from "@/lib/links";

export const metadata = {
  title: "About — Ivaylo Benliyski",
  description: "Director of Product in iGaming, studying AI in Business, writing about AI in plain language.",
};

const facts = [
  { label: "Role", value: "Director of Product, Playtech" },
  { label: "Studying", value: "Master's in AI in Business, IBS Bulgaria" },
  { label: "Based in", value: "Sofia, Bulgaria" },
];

const inlineLink = "text-fg underline decoration-fg/30 underline-offset-4 hover:decoration-fg transition-colors";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
      <div className="grid lg:grid-cols-[1fr_20rem] gap-12 lg:gap-20">
        <article>
          <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-4">About</p>
          <h1 className="font-tech text-4xl md:text-6xl font-bold tracking-tight text-fg mb-10 text-balance">
            Hi, I&apos;m Ivaylo.
          </h1>

          <div className="flex flex-col gap-6 font-casual text-lg text-fg/80 leading-[1.75] max-w-2xl text-pretty">
            <p>
              I&apos;m Director of Product at <span className="text-fg">Playtech</span>, based in Sofia, Bulgaria.
              I work at the intersection of regulated iGaming markets and AI, scoping and building products that make
              complex systems smarter, faster, and more human.
            </p>
            <p>
              My day job is product leadership — translating messy business problems into things that actually ship.
              But the thread running through everything I do is AI: how it changes what&apos;s possible, how teams adopt
              it, and what it means for the industries it touches.
            </p>
            <p>
              I&apos;m currently pursuing a Master&apos;s in <span className="text-fg">AI in Business</span> at IBS
              Bulgaria — because I think the most interesting work right now happens at the boundary between deep domain
              expertise and emerging technology. iGaming is one of the most regulated, fast-moving, and data-rich
              industries there is. AI in that context is genuinely hard and genuinely exciting.
            </p>
            <p>
              This site is where I think out loud. The <Link href="/blog" className={inlineLink}>blog</Link> is my
              attempt to explain what&apos;s actually happening in AI, the{" "}
              <Link href="/vocabulary" className={inlineLink}>vocabulary</Link> decodes the jargon, and the{" "}
              <Link href="/projects" className={inlineLink}>projects</Link> section is where I build things to test my
              own thinking.
            </p>
          </div>

          {/* Logo story */}
          <figure className="mt-14 relative overflow-hidden rounded-3xl border border-line bg-card p-7 sm:p-10 max-w-2xl">
            <Logo size={240} className="absolute -right-14 -top-14 opacity-[0.07] pointer-events-none" />
            <blockquote className="font-casual italic text-2xl sm:text-3xl text-fg leading-snug mb-6">
              &ldquo;Square the circle, the circle source of his power.&rdquo;
            </blockquote>
            <figcaption className="font-casual text-fg/75 leading-relaxed flex flex-col gap-4">
              <span>
                The logo started with that lyric, and it sent me down a rabbit hole. Squaring the circle is one of the
                oldest problems in mathematics: construct a square with the exact same area as a given circle, using only
                a compass and straightedge. In 1882 it was proven <span className="text-fg">impossible</span>.
              </span>
              <span>
                I like that. Not as a symbol of failure — but as a metaphor for the kind of problems worth working on.
                Structure and creativity. Regulation and innovation. Human intuition and machine intelligence. You know it
                can&apos;t be perfect. You try regardless.
              </span>
            </figcaption>
          </figure>
        </article>

        {/* Sidebar */}
        <aside className="lg:pt-24">
          <div className="lg:sticky lg:top-24 flex flex-col gap-6">
            <dl className="rounded-2xl border border-line divide-y divide-line">
              {facts.map((f) => (
                <div key={f.label} className="px-5 py-4">
                  <dt className="font-tech text-xs uppercase tracking-[0.18em] text-fg/50 mb-1">{f.label}</dt>
                  <dd className="font-tech text-fg">{f.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-2">
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 font-tech text-sm text-fg border border-line rounded-full px-5 py-3 hover:border-fg/50 transition-colors"
              >
                <LinkedInIcon size={16} /> Connect on LinkedIn
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-3 font-tech text-sm text-fg border border-line rounded-full px-5 py-3 hover:border-fg/50 transition-colors break-all"
              >
                <MailIcon size={16} /> {EMAIL}
              </a>
              <a
                href={TELEGRAM_DAILY}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 font-tech text-sm font-semibold bg-fg text-bg rounded-full px-5 py-3 hover:bg-white transition-colors"
              >
                <TelegramIcon size={16} /> Join the daily digest
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
