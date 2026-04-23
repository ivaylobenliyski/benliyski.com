import Logo from "@/components/Logo";

export const metadata = {
  title: "About — Ivaylo Benliyski",
};

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">

      {/* Header */}
      <div className="flex items-center gap-4 mb-14">
        <Logo size={40} />
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-[#F3E9D7]">
          About
        </h1>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-6 font-[family-name:var(--font-lora)] text-[#F3E9D7]/75 leading-relaxed text-base">
        <p>
          I&apos;m Ivaylo — Director of Product at{" "}
          <span className="text-[#F3E9D7]">Playtech</span>, based in Sofia, Bulgaria.
          I work at the intersection of regulated iGaming markets and AI, scoping and building
          products that make complex systems smarter, faster, and more human.
        </p>
        <p>
          My day job is product leadership — translating messy business problems into things
          that actually ship. But the thread running through everything I do is AI: how it changes
          what&apos;s possible, how teams adopt it, and what it means for the industries it touches.
        </p>
        <p>
          I&apos;m currently pursuing a Master&apos;s in{" "}
          <span className="text-[#F3E9D7]">AI in Business</span> at IBS Bulgaria — because I
          think the most interesting work right now happens at the boundary between deep domain
          expertise and emerging technology. iGaming is one of the most regulated, fast-moving,
          and data-rich industries there is. AI in that context is genuinely hard and genuinely
          exciting.
        </p>
        <p>
          This site is where I think out loud. The{" "}
          <a href="/ai-series" className="text-[#F3E9D7] underline underline-offset-4 hover:text-white transition-colors">
            AI series
          </a>{" "}
          is my attempt to explain what&apos;s actually happening in AI — without the hype and
          without the unnecessary complexity. The{" "}
          <a href="/projects" className="text-[#F3E9D7] underline underline-offset-4 hover:text-white transition-colors">
            projects
          </a>{" "}
          section is where I build things to test my own thinking.
        </p>
        <p>
          The logo started with a lyric —{" "}
          <em>&ldquo;square the circle, the circle source of his power.&rdquo;</em>{" "}
          That sent me down a rabbit hole. Squaring the circle is one of the oldest unsolved
          problems in mathematics: construct a square with the exact same area as a given circle,
          using only a compass and straightedge. In 1882 it was proven{" "}
          <span className="text-[#F3E9D7]">impossible</span>.
        </p>
        <p>
          I like that. Not as a symbol of failure — but as a metaphor for the kind of problems
          worth working on. The ones where two fundamentally incompatible things need to be
          reconciled anyway. Structure and creativity. Regulation and innovation. Human intuition
          and machine intelligence. You know it can&apos;t be perfect. You try regardless.
        </p>
      </div>

      {/* Contact */}
      <div className="mt-12 pt-8 border-t border-[#F3E9D7]/10 flex flex-col gap-4">
        <a
          href="https://www.linkedin.com/in/ivaylo-benliyski-483933178/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-[family-name:var(--font-space-grotesk)] text-sm text-[#F3E9D7]/60 hover:text-[#F3E9D7] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>
        <a
          href="mailto:ivaylobenliyski@gmail.com"
          className="inline-flex items-center gap-2 font-[family-name:var(--font-space-grotesk)] text-sm text-[#F3E9D7]/60 hover:text-[#F3E9D7] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          ivaylobenliyski@gmail.com
        </a>
      </div>
    </div>
  );
}
