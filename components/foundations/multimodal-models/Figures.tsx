/* Static illustrations for the "Multimodal models" guide. */

/* ── Everything becomes tokens ──────────────────────────────────────────── */

const INPUTS = [
  { name: "Text", how: "split into word pieces", chips: ["What's", " in", " this", " photo", "?"], tint: "bg-sage/30" },
  { name: "Image", how: "cut into small patches", chips: ["▦", "▦", "▦", "▦", "▦", "▦"], tint: "bg-[#d9b98a]/30" },
  { name: "Audio", how: "sliced into short chunks", chips: ["∿", "∿", "∿", "∿", "∿"], tint: "bg-[#9fc3e0]/30" },
];

export function EverythingTokens() {
  return (
    <div className="grid md:grid-cols-[1.25fr_auto_1fr] gap-4 items-center">
      <div className="space-y-3">
        {INPUTS.map((inp) => (
          <div key={inp.name} className="rounded-xl border border-line bg-bg p-3.5">
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <span className="font-tech text-sm font-semibold text-fg">{inp.name}</span>
              <span className="font-tech text-xs text-fg/45">{inp.how}</span>
            </div>
            <div className="flex flex-wrap gap-1 font-mono text-xs">
              {inp.chips.map((ch, i) => (
                <span key={i} className={`${inp.tint} text-fg rounded-sm px-1.5 py-1 whitespace-pre`}>{ch}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex md:flex-col items-center justify-center gap-2 text-fg/40" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="w-7 h-7 rotate-90 md:rotate-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </div>
      <div className="rounded-2xl border border-sage/60 bg-sage/10 p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-2">One sequence of tokens</p>
        <div className="flex flex-wrap gap-1 font-mono text-xs mb-4" aria-hidden="true">
          {["▦", "▦", "▦", "What's", " in", " this", " photo", "?"].map((ch, i) => (
            <span key={i} className={`${i < 3 ? "bg-[#d9b98a]/30" : "bg-sage/30"} text-fg rounded-sm px-1.5 py-1 whitespace-pre`}>{ch}</span>
          ))}
        </div>
        <p className="font-tech text-lg font-semibold text-fg mb-1">One transformer</p>
        <p className="font-casual text-sm text-fg/65 leading-relaxed">
          Attention connects every piece with every other — a word in your question can “look at” the right patch of the photo.
        </p>
      </div>
    </div>
  );
}

/* ── What they can do ───────────────────────────────────────────────────── */

const CAN = [
  { icon: "📄", t: "Read documents", d: "Scanned forms, receipts, handwriting, charts and slides." },
  { icon: "📸", t: "Explain a photo", d: "What a sign says, what's wrong with a plant, which part is broken." },
  { icon: "🗣️", t: "Hold a spoken conversation", d: "Listen and answer out loud in real time, across languages." },
  { icon: "🎞️", t: "Understand video", d: "Summarise a recording, find the moment something happens." },
  { icon: "🖥️", t: "Use a computer", d: "Look at screenshots, then click and type to complete tasks — still experimental." },
  { icon: "🎨", t: "Create across formats", d: "Turn a sketch into code, a description into an image, text into speech." },
];

export function Capabilities() {
  return (
    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CAN.map((c) => (
        <li key={c.t} className="rounded-2xl border border-line bg-bg p-5">
          <span className="text-2xl" aria-hidden="true">{c.icon}</span>
          <p className="font-tech font-semibold text-fg mt-2 mb-1">{c.t}</p>
          <p className="font-casual text-sm text-fg/65 leading-relaxed">{c.d}</p>
        </li>
      ))}
    </ul>
  );
}

/* ── Hero art ───────────────────────────────────────────────────────────── */

export function HeroArt() {
  return (
    <svg viewBox="0 0 300 200" className="absolute -right-4 -top-6 w-[210px] md:w-[350px] opacity-20 md:opacity-35 pointer-events-none" aria-hidden="true">
      <g fill="none" stroke="var(--sage)" strokeWidth="1.5">
        <path d="M 40 40 C 120 40, 120 100, 200 100" />
        <path d="M 40 100 L 200 100" />
        <path d="M 40 160 C 120 160, 120 100, 200 100" />
      </g>
      <g fontFamily="var(--font-space-grotesk)" fontSize="18" fill="var(--fg)" textAnchor="middle">
        <text x="22" y="46">Aa</text>
        <text x="22" y="106">▦</text>
        <text x="22" y="166">∿</text>
      </g>
      <circle cx="230" cy="100" r="30" fill="var(--sage)" fillOpacity="0.25" stroke="var(--fg)" strokeWidth="1.5" />
    </svg>
  );
}
