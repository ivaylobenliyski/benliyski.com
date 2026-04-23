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

          <div className="flex gap-4 mt-2">
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
