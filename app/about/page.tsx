import Logo from "@/components/Logo";

export const metadata = {
  title: "About — Ivaylo Benliyski",
};

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="flex items-center gap-4 mb-14">
        <Logo size={40} />
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-[#F3E9D7]">
          About
        </h1>
      </div>

      <div className="flex flex-col gap-6 font-[family-name:var(--font-lora)] text-[#F3E9D7]/75 leading-relaxed text-base">
        <p>
          Hey — I&apos;m Ivaylo, based in Sofia. I spend a lot of time thinking about AI: what it can actually do, where it&apos;s genuinely useful, and what it changes about how we work and think.
        </p>
        <p>
          This site is where I put that thinking. The{" "}
          <a href="/ai-series" className="text-[#F3E9D7] underline underline-offset-4 hover:text-white transition-colors">
            AI series
          </a>{" "}
          is educational — I wanted to write the explainers I wished existed when I was starting out. The{" "}
          <a href="/projects" className="text-[#F3E9D7] underline underline-offset-4 hover:text-white transition-colors">
            projects
          </a>{" "}
          section is where the building happens.
        </p>
        <p>
          The logo is a circle with an inscribed square — a nod to a lyric that stuck with me: <em>&ldquo;square the circle, the circle source of his power.&rdquo;</em> Something about that image felt right.
        </p>
      </div>

      {/* Logo preview — both variants in context */}
      <div className="mt-16 pt-8 border-t border-[#F3E9D7]/10">
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 uppercase tracking-widest mb-6">
          Logo variants
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center gap-3 bg-[#16302B] border border-[#F3E9D7]/10 rounded-2xl p-8">
            <img src="/logo.svg" width={80} height={80} alt="Logo on dark" />
            <span className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40">
              Cream — dark bg
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 bg-[#F3E9D7] rounded-2xl p-8">
            <img src="/logo-dark.svg" width={80} height={80} alt="Logo on light" />
            <span className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#16302B]/50 text-sm">
              Green — light bg
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-[#F3E9D7]/10">
        <a
          href="https://www.linkedin.com/in/ivaylobenliyski"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-[family-name:var(--font-space-grotesk)] text-sm text-[#F3E9D7]/60 hover:text-[#F3E9D7] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>
      </div>
    </div>
  );
}
