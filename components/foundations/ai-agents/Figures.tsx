/* Static illustrations for the "AI agents" guide. */

/* ── Chatbot → workflow → agent ─────────────────────────────────────────── */

const LEVELS = [
  {
    name: "Chatbot",
    who: "You drive every step",
    text: "Answers one message at a time. Nothing happens unless you ask.",
    eg: "Asking a chatbot to explain a contract",
  },
  {
    name: "Workflow",
    who: "Code decides the steps",
    text: "Models and tools run along a path a developer wrote in advance.",
    eg: "Every new invoice → extract fields → check totals → file it",
  },
  {
    name: "Agent",
    who: "The model decides the steps",
    text: "Given a goal, the model chooses which tools to use and what to do next, based on what it finds.",
    eg: "“Research these five suppliers and draft a comparison”",
  },
];

export function AutonomySpectrum() {
  return (
    <div>
      <div className="hidden sm:block relative h-2 rounded-full bg-gradient-to-r from-line via-sage/50 to-sage mb-4" aria-hidden="true" />
      <ol className="grid sm:grid-cols-3 gap-3">
        {LEVELS.map((l, i) => (
          <li key={l.name} className={`rounded-2xl border p-5 bg-bg ${i === 2 ? "border-sage/60" : "border-line"}`}>
            <p className="font-tech text-[11px] uppercase tracking-[0.14em] text-sage mb-1.5">{l.who}</p>
            <p className="font-tech text-lg font-semibold text-fg mb-2">{l.name}</p>
            <p className="font-casual text-sm text-fg/70 leading-relaxed mb-3">{l.text}</p>
            <p className="font-tech text-xs text-fg/45 leading-relaxed">e.g. {l.eg}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 font-tech text-xs text-fg/45 text-right">more autonomy →</p>
    </div>
  );
}

/* ── The model and its tools ────────────────────────────────────────────── */

const TOOLS = [
  { icon: "🔎", name: "Web search" },
  { icon: "📅", name: "Calendar" },
  { icon: "📁", name: "Files & docs" },
  { icon: "🧮", name: "Run code" },
  { icon: "🖥️", name: "Use a screen" },
  { icon: "✉️", name: "Email" },
];

export function ToolsFigure() {
  const R = 110;
  return (
    <div className="grid md:grid-cols-[1fr_1fr] gap-6 items-center">
      <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto block" role="img" aria-label="A language model in the centre, connected to tools such as web search, calendar, files, code, screen and email">
        {TOOLS.map((t, i) => {
          const a = (i / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
          const x = 150 + R * Math.cos(a);
          const y = 150 + R * Math.sin(a);
          return (
            <g key={t.name}>
              <line x1="150" y1="150" x2={x} y2={y} stroke="var(--sage)" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx={x} cy={y} r="28" fill="var(--bg)" stroke="var(--line)" strokeWidth="1.5" />
              <text x={x} y={y + 7} textAnchor="middle" fontSize="20">{t.icon}</text>
            </g>
          );
        })}
        <circle cx="150" cy="150" r="44" fill="var(--sage)" fillOpacity="0.2" stroke="var(--fg)" strokeWidth="2" />
        <text x="150" y="146" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="var(--font-space-grotesk)" fill="var(--fg)">language</text>
        <text x="150" y="162" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily="var(--font-space-grotesk)" fill="var(--fg)">model</text>
      </svg>
      <ul className="grid grid-cols-2 gap-2">
        {TOOLS.map((t) => (
          <li key={t.name} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 font-tech text-sm text-fg/80">
            <span aria-hidden="true">{t.icon}</span>
            {t.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Doubling ───────────────────────────────────────────────────────────── */

export function DoublingFigure() {
  const bars = [1, 2, 4, 8, 16];
  return (
    <div>
      <div className="flex items-end gap-3 h-40" aria-hidden="true">
        {bars.map((b, i) => (
          <div key={b} className="flex-1 flex flex-col items-center justify-end h-full">
            <span className="font-tech text-xs text-fg/60 mb-1">{b}×</span>
            <div className="w-full rounded-t-lg bg-sage" style={{ height: `${(b / 16) * 100}%`, opacity: 0.45 + i * 0.13 }} />
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-2">
        {bars.map((b, i) => (
          <span key={b} className="flex-1 text-center font-tech text-[11px] text-fg/45">
            {i === 0 ? "now" : `+${i * 7} mo`}
          </span>
        ))}
      </div>
      <p className="sr-only">If task length doubles every seven months, it grows sixteen-fold in a little over two years.</p>
    </div>
  );
}

/* ── Hero art ───────────────────────────────────────────────────────────── */

export function HeroArt() {
  return (
    <svg viewBox="0 0 300 220" className="absolute -right-4 -top-6 w-[210px] md:w-[340px] opacity-20 md:opacity-35 pointer-events-none" aria-hidden="true">
      <defs>
        <marker id="ag-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sage)" />
        </marker>
      </defs>
      <g fill="none" stroke="var(--sage)" strokeWidth="2">
        <path d="M 150 30 A 80 80 0 0 1 225 140" markerEnd="url(#ag-arrow)" />
        <path d="M 210 175 A 80 80 0 0 1 90 175" markerEnd="url(#ag-arrow)" />
        <path d="M 75 140 A 80 80 0 0 1 135 32" markerEnd="url(#ag-arrow)" />
      </g>
      <g fontFamily="var(--font-space-grotesk)" fontSize="15" fill="var(--fg)" textAnchor="middle">
        <text x="150" y="20">think</text>
        <text x="255" y="165">act</text>
        <text x="45" y="165">observe</text>
      </g>
    </svg>
  );
}
