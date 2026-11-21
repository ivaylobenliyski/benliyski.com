/* Static illustrations for the "Language models" guide. */

/* ── Tokens ─────────────────────────────────────────────────────────────── */

const TOKENS = ["Token", "ization", " isn", "'t", " magic", "!", " Un", "believ", "ably", " simple", "."];
const TINTS = ["bg-sage/30", "bg-[#d9b98a]/30", "bg-[#9fc3e0]/30", "bg-[#e3a08a]/30"];

export function TokenStrip() {
  return (
    <div>
      <p className="font-casual text-lg sm:text-xl text-fg mb-4">
        “Tokenization isn&apos;t magic! Unbelievably simple.”
      </p>
      <div className="flex flex-wrap gap-y-2 font-mono text-sm sm:text-base" aria-label="The sentence split into 11 tokens">
        {TOKENS.map((t, i) => (
          <span key={i} className={`${TINTS[i % TINTS.length]} text-fg px-1 py-1 rounded-sm whitespace-pre border-r border-bg`}>
            {t}
          </span>
        ))}
      </div>
      <p className="mt-4 font-tech text-xs text-fg/50">
        An illustrative split: 11 tokens for 5 words. Each model has its own tokenizer, but the idea is the same — common words are often one token, rare or long ones get split into pieces.
      </p>
    </div>
  );
}

/* ── How a chatbot is built ─────────────────────────────────────────────── */

const STAGES = [
  {
    name: "Pre-training",
    what: "Predict the next token across a huge amount of text: websites, books, code.",
    result: "A model that knows a lot about language and the world — but just continues text.",
  },
  {
    name: "Instruction tuning",
    what: "Learn from many examples of questions paired with good, human-written answers.",
    result: "A model that follows instructions instead of rambling on.",
  },
  {
    name: "Feedback & reinforcement",
    what: "People (or other models) rank answers; the model is rewarded for preferred ones. Newer models are also rewarded for correctly solving problems step by step.",
    result: "A more helpful, safer assistant — and, in reasoning models, better problem-solving.",
  },
];

export function BuildPipeline() {
  return (
    <ol className="grid md:grid-cols-3 gap-3">
      {STAGES.map((s, i) => (
        <li key={s.name} className="relative rounded-2xl border border-line bg-bg p-5">
          <span className="block w-8 h-1 rounded-full bg-sage mb-4" style={{ opacity: 0.4 + i * 0.3 }} aria-hidden="true" />
          <p className="font-tech text-lg font-semibold text-fg mb-2">{s.name}</p>
          <p className="font-casual text-sm text-fg/70 leading-relaxed mb-3">{s.what}</p>
          <p className="font-casual text-sm text-fg leading-relaxed border-t border-line pt-3">
            <span className="font-tech text-[11px] uppercase tracking-[0.14em] text-sage mr-1.5">Result</span>
            {s.result}
          </p>
          {i < STAGES.length - 1 && (
            <span className="hidden md:flex absolute -right-[14px] top-8 z-10 w-6 h-6 rounded-full bg-fg text-bg items-center justify-center" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/* ── Context window ─────────────────────────────────────────────────────── */

export function ContextWindow() {
  const rows = [
    { label: "GPT-3 (2020)", tokens: "2,048 tokens", words: "≈ 1,500 words — a few pages", pct: 4 },
    { label: "Gemini 1.5 Pro preview (2024)", tokens: "1,000,000 tokens", words: "≈ 750,000 words — several long novels", pct: 100 },
  ];
  return (
    <div className="space-y-5">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex flex-wrap justify-between gap-x-4 mb-1.5">
            <span className="font-tech text-sm font-semibold text-fg">{r.label}</span>
            <span className="font-tech text-sm text-fg/60">{r.tokens}</span>
          </div>
          <div className="h-4 rounded-full bg-line overflow-hidden">
            <div className="h-full rounded-full bg-sage" style={{ width: `${r.pct}%`, minWidth: "6px" }} />
          </div>
          <p className="mt-1 font-casual text-sm text-fg/55">{r.words}</p>
        </div>
      ))}
      <p className="font-tech text-xs text-fg/45">
        Not to scale: the real difference is about 500×, so a true-scale GPT-3 bar would be almost invisible. Word counts use the rule of thumb of about ¾ of a word per token in English.
      </p>
    </div>
  );
}

/* ── Good at / watch out for ────────────────────────────────────────────── */

export function StrengthsLimits() {
  const good = ["Drafting, rewriting and summarising text", "Explaining concepts at any level", "Writing and debugging code", "Translating between languages", "Brainstorming options"];
  const watch = [
    "Stating false things confidently (“hallucinating”)",
    "Facts after their training cut-off — unless given search",
    "Exact counting, arithmetic and spelling tricks",
    "Reflecting biases in their training data",
    "Following instructions hidden in documents they read",
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-2xl border border-sage/50 bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-3">Usually strong at</p>
        <ul className="space-y-2">
          {good.map((g) => (
            <li key={g} className="flex gap-2.5 font-casual text-sm text-fg/80 leading-relaxed">
              <span className="text-sage" aria-hidden="true">✓</span>
              {g}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-[#e3a08a]/40 bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-[#e3a08a] mb-3">Watch out for</p>
        <ul className="space-y-2">
          {watch.map((g) => (
            <li key={g} className="flex gap-2.5 font-casual text-sm text-fg/80 leading-relaxed">
              <span className="text-[#e3a08a]" aria-hidden="true">!</span>
              {g}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Hero art ───────────────────────────────────────────────────────────── */

export function HeroArt() {
  const bars = [0.9, 0.55, 0.42, 0.3, 0.18, 0.1];
  return (
    <svg viewBox="0 0 300 200" className="absolute -right-4 -top-6 w-[200px] md:w-[340px] opacity-20 md:opacity-35 pointer-events-none" aria-hidden="true">
      <text x="10" y="30" fontFamily="var(--font-lora)" fontSize="20" fill="var(--fg)" fontStyle="italic">The cat sat on the …</text>
      {bars.map((b, i) => (
        <rect key={i} x="10" y={50 + i * 24} width={b * 270} height="14" rx="7" fill="var(--sage)" opacity={1 - i * 0.13} />
      ))}
    </svg>
  );
}
