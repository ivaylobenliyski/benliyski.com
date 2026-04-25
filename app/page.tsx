import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 overflow-hidden">

        {/* Subtle radial background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, #1e3d35 0%, #16302B 70%)",
          }}
        />

        {/* Faint grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#F3E9D7 1px, transparent 1px), linear-gradient(90deg, #F3E9D7 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
          <Logo size={160} animate />

          <div className="flex flex-col gap-3">
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl md:text-6xl font-bold tracking-tight text-[#F3E9D7]">
              Ivaylo Benliyski
            </h1>
            <p className="font-[family-name:var(--font-lora)] text-xl text-[#F3E9D7]/55 italic max-w-md mx-auto leading-relaxed">
              Building at the intersection of AI and curiosity.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 mt-2 w-full">
            <div className="flex gap-4 justify-center">
              <Link
                href="/blog"
                className="font-[family-name:var(--font-space-grotesk)] text-sm bg-[#F3E9D7] text-[#16302B] px-6 py-3 rounded-full font-semibold hover:bg-white transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/vocabulary"
                className="font-[family-name:var(--font-space-grotesk)] text-sm border border-[#F3E9D7]/30 text-[#F3E9D7] px-6 py-3 rounded-full font-semibold hover:border-[#F3E9D7]/70 transition-colors"
              >
                Vocabulary
              </Link>
            </div>
            <div className="flex items-center gap-3 justify-center w-full">
              <a
                href="https://t.me/+rvYIKg52lkA4OGY8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-[family-name:var(--font-space-grotesk)] text-xs font-semibold border border-[#F3E9D7]/15 text-[#F3E9D7]/60 px-5 py-2.5 rounded-full hover:border-[#F3E9D7]/40 hover:text-[#F3E9D7] transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Daily Digest
              </a>
              <div className="w-px h-4 bg-[#F3E9D7]/15" />
              <a
                href="https://t.me/+iXi5xEkYGTxlMjk0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-[family-name:var(--font-space-grotesk)] text-xs font-semibold border border-[#F3E9D7]/15 text-[#F3E9D7]/60 px-5 py-2.5 rounded-full hover:border-[#F3E9D7]/40 hover:text-[#F3E9D7] transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Weekly Digest
              </a>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="font-[family-name:var(--font-space-grotesk)] text-[10px] uppercase tracking-widest text-[#F3E9D7]">scroll</span>
          <div className="w-px h-8 bg-[#F3E9D7]" />
        </div>
      </section>

      {/* Cards section */}
      <section className="max-w-4xl mx-auto w-full px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/blog"
          className="group bg-[#1e3d35] border border-[#F3E9D7]/10 rounded-2xl p-8 hover:border-[#F3E9D7]/30 transition-all hover:-translate-y-0.5"
        >
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 uppercase tracking-widest mb-3">
            Blog
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#F3E9D7] mb-3 group-hover:text-white transition-colors">
            AI Trends
          </h2>
          <p className="font-[family-name:var(--font-lora)] text-[#F3E9D7]/55 text-sm leading-relaxed">
            What&apos;s actually happening in AI — and what it means for the industries it&apos;s touching.
          </p>
        </Link>

        <Link
          href="/vocabulary"
          className="group bg-[#1e3d35] border border-[#F3E9D7]/10 rounded-2xl p-8 hover:border-[#F3E9D7]/30 transition-all hover:-translate-y-0.5"
        >
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 uppercase tracking-widest mb-3">
            Vocabulary
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#F3E9D7] mb-3 group-hover:text-white transition-colors">
            The Jargon, Decoded
          </h2>
          <p className="font-[family-name:var(--font-lora)] text-[#F3E9D7]/55 text-sm leading-relaxed">
            AI terms explained without the fluff — for curious people, not just engineers.
          </p>
        </Link>

        <Link
          href="/projects"
          className="group bg-[#1e3d35] border border-[#F3E9D7]/10 rounded-2xl p-8 hover:border-[#F3E9D7]/30 transition-all hover:-translate-y-0.5"
        >
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 uppercase tracking-widest mb-3">
            Projects
          </p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#F3E9D7] mb-3 group-hover:text-white transition-colors">
            Things I&apos;ve Built
          </h2>
          <p className="font-[family-name:var(--font-lora)] text-[#F3E9D7]/55 text-sm leading-relaxed">
            Side projects, experiments, and tools — from AI news digests to whatever&apos;s next.
          </p>
        </Link>
      </section>
    </div>
  );
}
