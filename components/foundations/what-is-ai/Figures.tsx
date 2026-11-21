/* Static illustrations for the "What is AI?" guide. */

/* ── Input → infer → output (the OECD / EU definition, drawn) ───────────── */

const OUTPUTS = [
  { kind: "Prediction", example: "“This card payment is 97% likely to be fraud”" },
  { kind: "Content", example: "A drafted email, an image, a summary" },
  { kind: "Recommendation", example: "The next song in your playlist" },
  { kind: "Decision", example: "A self-driving car brakes" },
];

export function InputInferOutput() {
  return (
    <div className="grid md:grid-cols-[1fr_auto_1.1fr_auto_1.4fr] items-stretch gap-3 md:gap-2">
      <div className="rounded-2xl border border-line bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-2">1 · Input</p>
        <p className="font-tech font-semibold text-fg mb-2">It receives something</p>
        <p className="font-casual text-sm text-fg/65 leading-relaxed">A question, a photo, sensor readings, what you clicked last week.</p>
      </div>
      <Arrow />
      <div className="rounded-2xl border border-sage/60 bg-bg p-5 relative overflow-hidden">
        <svg viewBox="0 0 120 60" className="absolute -right-4 -bottom-3 w-28 opacity-25" aria-hidden="true">
          <g fill="none" stroke="var(--sage)" strokeWidth="1.5">
            <circle cx="10" cy="15" r="5" /><circle cx="10" cy="45" r="5" />
            <circle cx="60" cy="8" r="5" /><circle cx="60" cy="30" r="5" /><circle cx="60" cy="52" r="5" />
            <circle cx="110" cy="30" r="5" />
            <path d="M15 15 55 8M15 15 55 30M15 45 55 30M15 45 55 52M65 8 105 30M65 30h40M65 52 105 30" />
          </g>
        </svg>
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-2">2 · Infer</p>
        <p className="font-tech font-semibold text-fg mb-2">It works out a response</p>
        <p className="font-casual text-sm text-fg/65 leading-relaxed relative">
          Using patterns it learned or logic it was given — not a fixed answer someone typed in for this exact case.
        </p>
      </div>
      <Arrow />
      <div className="rounded-2xl border border-line bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-3">3 · Output</p>
        <ul className="space-y-2.5">
          {OUTPUTS.map((o) => (
            <li key={o.kind} className="flex flex-col">
              <span className="font-tech text-sm font-semibold text-fg">{o.kind}</span>
              <span className="font-casual text-sm text-fg/60 leading-snug">{o.example}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-fg/40" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="w-6 h-6 rotate-90 md:rotate-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  );
}

/* ── Russell & Norvig's four approaches ─────────────────────────────────── */

const APPROACHES = [
  { row: "Thinking", col: "like a human", text: "Model how people actually think — the cognitive-science route.", hl: false },
  { row: "Thinking", col: "rationally", text: "Reason with the rules of logic to reach correct conclusions.", hl: false },
  { row: "Acting", col: "like a human", text: "Behave indistinguishably from a person — Turing's test.", hl: false },
  { row: "Acting", col: "rationally", text: "Do whatever best achieves the goal, given what it knows. The textbook's preferred view.", hl: true },
];

export function FourApproaches() {
  return (
    <div>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 sm:gap-3">
        <span />
        {["…like a human", "…rationally"].map((h) => (
          <p key={h} className="font-tech text-[11px] uppercase tracking-[0.14em] text-fg/45 text-center pb-1">{h}</p>
        ))}
        {["Thinking…", "Acting…"].map((row, ri) => (
          <div key={row} className="contents">
            <p className="font-tech text-[11px] uppercase tracking-[0.14em] text-fg/45 [writing-mode:vertical-rl] rotate-180 self-center text-center">{row}</p>
            {APPROACHES.slice(ri * 2, ri * 2 + 2).map((a) => (
              <div key={a.row + a.col} className={`rounded-2xl border p-4 sm:p-5 ${a.hl ? "border-sage/70 bg-sage/10" : "border-line bg-bg"}`}>
                <p className="font-tech text-sm sm:text-base font-semibold text-fg mb-1.5">
                  {a.row} {a.col}
                </p>
                <p className="font-casual text-[13px] sm:text-sm text-fg/65 leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Narrow → general spectrum ──────────────────────────────────────────── */

const STOPS = [
  {
    label: "Narrow AI",
    status: "Everywhere today",
    text: "Does one job, often superhumanly well: spot spam, recognise faces, play Go.",
    at: "8%",
  },
  {
    label: "General-purpose models",
    status: "Today, uneven",
    text: "Chatbots that write, code, translate and analyse — impressive on many tasks, still unreliable on others.",
    at: "50%",
  },
  {
    label: "AGI",
    status: "Hypothetical · no agreed definition",
    text: "AI that matches people across most thinking tasks. Researchers disagree on what exactly counts and how to measure it.",
    at: "92%",
  },
];

export function Spectrum() {
  return (
    <div>
      {/* bar (desktop) */}
      <div className="hidden sm:block relative h-10 mb-2" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-sage via-sage/50 to-transparent border border-line" />
        {STOPS.map((s, i) => (
          <span
            key={s.label}
            className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 ${
              i === 2 ? "border-dashed border-fg/50 bg-bg" : "border-fg bg-bg"
            }`}
            style={{ left: s.at }}
          />
        ))}
      </div>
      <ol className="grid sm:grid-cols-3 gap-3">
        {STOPS.map((s, i) => (
          <li key={s.label} className={`rounded-2xl border p-5 ${i === 2 ? "border-dashed border-fg/30" : "border-line"} bg-bg`}>
            <p className={`font-tech text-[11px] uppercase tracking-[0.14em] mb-1.5 ${i === 2 ? "text-fg/45" : "text-sage"}`}>{s.status}</p>
            <p className="font-tech text-lg font-semibold text-fg mb-1.5">{s.label}</p>
            <p className="font-casual text-sm text-fg/65 leading-relaxed">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Hero art ───────────────────────────────────────────────────────────── */

export function HeroArt() {
  return (
    <svg viewBox="0 0 300 300" className="absolute -right-6 -top-10 w-[200px] md:w-[340px] opacity-20 md:opacity-35 pointer-events-none" aria-hidden="true">
      <g fill="none" stroke="var(--sage)" strokeWidth="1.5">
        <circle cx="150" cy="150" r="140" />
        <circle cx="150" cy="176" r="108" />
        <circle cx="150" cy="202" r="76" />
        <circle cx="150" cy="228" r="44" fill="var(--sage)" fillOpacity="0.25" />
      </g>
    </svg>
  );
}
