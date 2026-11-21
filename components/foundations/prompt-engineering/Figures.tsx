/* Static illustrations for the "Prompt engineering" guide. */

/* ── Anatomy of a good prompt ───────────────────────────────────────────── */

const PARTS = [
  { k: "Role", eg: "You are an experienced travel agent.", tint: "bg-[#9fc3e0]/20 border-[#9fc3e0]/60" },
  { k: "Context", eg: "I'm visiting Sofia for 3 days in May with two kids aged 6 and 9.", tint: "bg-[#d9b98a]/20 border-[#d9b98a]/60" },
  { k: "Task", eg: "Suggest a day-by-day plan.", tint: "bg-sage/20 border-sage/60" },
  { k: "Format", eg: "A table: day, morning, afternoon, evening.", tint: "bg-[#e3a08a]/20 border-[#e3a08a]/60" },
  { k: "Limits", eg: "Nothing more than 30 minutes by car; budget under €100 a day.", tint: "bg-fg/10 border-fg/30" },
];

export function PromptAnatomy() {
  return (
    <ol className="space-y-2">
      {PARTS.map((p) => (
        <li key={p.k} className={`grid grid-cols-[84px_1fr] sm:grid-cols-[110px_1fr] gap-3 items-baseline rounded-xl border px-4 py-3 ${p.tint}`}>
          <span className="font-tech text-xs uppercase tracking-[0.14em] text-fg/70">{p.k}</span>
          <span className="font-mono text-[13px] text-fg/90 leading-relaxed">{p.eg}</span>
        </li>
      ))}
    </ol>
  );
}

/* ── Technique cards ────────────────────────────────────────────────────── */

const TECHNIQUES = [
  { t: "Be clear and specific", d: "Say exactly what you want, as you would to a smart new colleague who knows nothing about your situation." },
  { t: "Give context and purpose", d: "Who it's for, why you need it, what good looks like. The model can't read your mind." },
  { t: "Show examples", d: "One or two examples of the output you want often beat a paragraph of description." },
  { t: "Structure long prompts", d: "Separate instructions, background and documents with headings or tags so nothing gets mixed up." },
  { t: "Let it think", d: "For tricky problems, ask it to work through the steps before answering." },
  { t: "Break big jobs up", d: "Split a complex task into steps and feed each result into the next prompt." },
];

export function Techniques() {
  return (
    <ul className="grid sm:grid-cols-2 gap-3">
      {TECHNIQUES.map((x) => (
        <li key={x.t} className="rounded-2xl border border-line bg-bg p-5">
          <p className="font-tech font-semibold text-fg mb-1.5">{x.t}</p>
          <p className="font-casual text-sm text-fg/65 leading-relaxed">{x.d}</p>
        </li>
      ))}
    </ul>
  );
}

/* ── Hero art ───────────────────────────────────────────────────────────── */

export function HeroArt() {
  return (
    <svg viewBox="0 0 300 200" className="absolute -right-4 -top-6 w-[210px] md:w-[340px] opacity-20 md:opacity-35 pointer-events-none" aria-hidden="true">
      <rect x="10" y="20" width="230" height="44" rx="22" fill="none" stroke="var(--sage)" strokeWidth="2" />
      <text x="30" y="48" fontFamily="var(--font-space-grotesk)" fontSize="15" fill="var(--fg)">Write me a…</text>
      <rect x="60" y="90" width="230" height="90" rx="18" fill="none" stroke="var(--fg)" strokeWidth="2" />
      {[112, 132, 152].map((y, i) => (
        <rect key={y} x="80" y={y} width={[180, 150, 110][i]} height="8" rx="4" fill="var(--sage)" />
      ))}
    </svg>
  );
}
