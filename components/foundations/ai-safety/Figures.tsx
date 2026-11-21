/* Static illustrations for the "AI safety" guide. */

/* ── Harms now vs risks ahead ───────────────────────────────────────────── */

const NOW = [
  { t: "Unfair decisions", d: "Models that work worse for some groups of people." },
  { t: "Made-up answers", d: "Confident, fluent, wrong — and believed." },
  { t: "Deepfakes & scams", d: "Realistic fake voices, images and video." },
  { t: "Privacy leaks", d: "Models repeating personal data they were trained on." },
  { t: "Misuse", d: "Help with cyberattacks or other harmful projects." },
];
const AHEAD = [
  { t: "Losing oversight", d: "Systems acting in ways people can't easily check or correct." },
  { t: "Goals that drift", d: "Highly capable systems pursuing what they were rewarded for, not what we meant." },
  { t: "Concentrated power", d: "A few actors controlling extremely capable AI." },
];

export function HarmsMap() {
  return (
    <div className="grid sm:grid-cols-[1.2fr_1fr] gap-3">
      <div className="rounded-2xl border border-[#e3a08a]/40 bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-[#e3a08a] mb-3">Happening now</p>
        <ul className="space-y-2.5">
          {NOW.map((x) => (
            <li key={x.t}>
              <p className="font-tech text-sm font-semibold text-fg">{x.t}</p>
              <p className="font-casual text-sm text-fg/60 leading-snug">{x.d}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-dashed border-fg/30 bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/50 mb-3">Debated, further ahead</p>
        <ul className="space-y-2.5">
          {AHEAD.map((x) => (
            <li key={x.t}>
              <p className="font-tech text-sm font-semibold text-fg">{x.t}</p>
              <p className="font-casual text-sm text-fg/60 leading-snug">{x.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Layers of defence ──────────────────────────────────────────────────── */

const LAYERS = [
  { t: "Training", d: "Teach the model good behaviour: human feedback, written principles." },
  { t: "Testing", d: "Red-team it: experts try hard to make it misbehave before release." },
  { t: "Safeguards", d: "Filters, monitoring and limits on what it can access or do." },
  { t: "Rules", d: "Company policies, independent evaluators and laws." },
];

export function DefenceLayers() {
  return (
    <div className="relative">
      <div className="grid sm:grid-cols-4 gap-3">
        {LAYERS.map((l, i) => (
          <div key={l.t} className="relative rounded-2xl border border-line bg-bg p-4 overflow-hidden">
            {/* holes, offset differently in each layer */}
            <svg viewBox="0 0 100 40" className="w-full h-10 mb-3" aria-hidden="true">
              <rect x="0" y="0" width="100" height="40" rx="6" fill="#d9b98a" opacity="0.25" />
              {[[18 + i * 14, 14, 6], [64 - i * 9, 26, 5], [86 - i * 4, 12, 4]].map(([cx, cy, r], k) => (
                <circle key={k} cx={cx} cy={cy} r={r} fill="var(--bg)" />
              ))}
            </svg>
            <p className="font-tech font-semibold text-fg mb-1">{l.t}</p>
            <p className="font-casual text-sm text-fg/65 leading-snug">{l.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Looking inside ─────────────────────────────────────────────────────── */

export function FeatureFigure() {
  const words = ["bridge", "fog", "San Francisco", "suspension", "red paint", "Golden Gate"];
  return (
    <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
      <div className="flex flex-wrap gap-1.5">
        {words.map((w) => (
          <span key={w} className="font-casual text-sm px-2 py-1 rounded-md bg-[#d9b98a]/25 text-fg">{w}</span>
        ))}
      </div>
      <svg viewBox="0 0 24 24" className="w-7 h-7 mx-auto text-fg/40 rotate-90 sm:rotate-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      <div className="rounded-2xl border border-sage/60 bg-sage/10 p-4">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-1">One “feature” inside the model</p>
        <p className="font-tech text-lg font-semibold text-fg">“Golden Gate Bridge”</p>
        <p className="font-casual text-sm text-fg/65 leading-snug mt-1">Lights up for text — and images — about the bridge. Turn it up, and the model starts bringing the bridge into unrelated answers.</p>
      </div>
    </div>
  );
}

/* ── Hero art ───────────────────────────────────────────────────────────── */

export function HeroArt() {
  return (
    <svg viewBox="0 0 240 240" className="absolute -right-4 -top-8 w-[180px] md:w-[300px] opacity-20 md:opacity-35 pointer-events-none" aria-hidden="true">
      <path d="M120 20 L200 52 V118 C200 166 164 204 120 220 C76 204 40 166 40 118 V52 Z" fill="none" stroke="var(--sage)" strokeWidth="3" />
      <path d="M88 122 l22 22 l44 -48" fill="none" stroke="var(--fg)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
