import Link from "next/link";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-20">

      {/* Hero */}
      <section className="flex flex-col items-start gap-6">
        <Logo size={56} />
        <div>
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-5xl font-bold tracking-tight text-[#F3E9D7] leading-tight">
            Ivaylo Benliyski
          </h1>
          <p className="font-[family-name:var(--font-lora)] text-xl text-[#F3E9D7]/60 mt-3 italic">
            Building at the intersection of AI and curiosity.
          </p>
        </div>
        <div className="flex gap-4 mt-2">
          <Link
            href="/ai-series"
            className="font-[family-name:var(--font-space-grotesk)] text-sm bg-[#F3E9D7] text-[#16302B] px-5 py-2.5 rounded-full font-semibold hover:bg-[#F3E9D7]/90 transition-colors"
          >
            AI Series
          </Link>
          <Link
            href="/projects"
            className="font-[family-name:var(--font-space-grotesk)] text-sm border border-[#F3E9D7]/30 text-[#F3E9D7] px-5 py-2.5 rounded-full font-semibold hover:border-[#F3E9D7]/70 transition-colors"
          >
            Projects
          </Link>
        </div>
      </section>

      {/* Featured cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/ai-series" className="group bg-[#1e3d35] border border-[#F3E9D7]/10 rounded-2xl p-6 hover:border-[#F3E9D7]/30 transition-colors">
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 uppercase tracking-widest mb-3">Series</p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#F3E9D7] mb-2 group-hover:text-white transition-colors">
            AI in Plain Sight
          </h2>
          <p className="font-[family-name:var(--font-lora)] text-[#F3E9D7]/60 text-sm leading-relaxed">
            An educational series breaking down how AI actually works — no hype, just clarity.
          </p>
        </Link>

        <Link href="/projects" className="group bg-[#1e3d35] border border-[#F3E9D7]/10 rounded-2xl p-6 hover:border-[#F3E9D7]/30 transition-colors">
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 uppercase tracking-widest mb-3">Projects</p>
          <h2 className="font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-[#F3E9D7] mb-2 group-hover:text-white transition-colors">
            Things I&apos;ve Built
          </h2>
          <p className="font-[family-name:var(--font-lora)] text-[#F3E9D7]/60 text-sm leading-relaxed">
            Side projects, experiments, and tools — from AI news digests to whatever&apos;s next.
          </p>
        </Link>
      </section>

    </div>
  );
}
