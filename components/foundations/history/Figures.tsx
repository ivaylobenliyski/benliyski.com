/* Static illustrations for the History of AI guide. All inline SVG/HTML so they
   scale crisply, follow the site palette and stay readable on phones. */

const FONT = "var(--font-space-grotesk)";

/* ── AI summers and winters ─────────────────────────────────────────────── */

const X0 = 40;
const X1 = 780;
const Y_BASE = 250;
const Y_RANGE = 200;
const Y0 = 1950;
const Y1 = 2026;
const xOf = (year: number) => X0 + ((year - Y0) / (Y1 - Y0)) * (X1 - X0);
const yOf = (level: number) => Y_BASE - level * Y_RANGE;

// Qualitative "enthusiasm & funding" curve — the shape historians describe, not a dataset.
const CURVE: [number, number][] = [
  [1950, 0.08], [1956, 0.28], [1965, 0.52], [1971, 0.44], [1975, 0.14], [1980, 0.26],
  [1985, 0.58], [1988, 0.32], [1992, 0.14], [1997, 0.27], [2005, 0.33], [2012, 0.48],
  [2017, 0.68], [2022, 0.9], [2026, 0.98],
];

function smoothPath(pts: [number, number][]) {
  const p = pts.map(([yr, lv]) => [xOf(yr), yOf(lv)] as const);
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const WINTERS = [
  { from: 1974, to: 1980, label: "1st winter" },
  { from: 1987, to: 1993, label: "2nd winter" },
];

const MARKERS = [
  { year: 1956, label: "Dartmouth", level: 0.28, up: true },
  { year: 1985, label: "Expert systems", level: 0.58, up: true },
  { year: 2012, label: "AlexNet", level: 0.48, up: false },
  { year: 2022, label: "ChatGPT", level: 0.9, up: false },
];

export function SeasonsChart() {
  const line = smoothPath(CURVE);
  const area = `${line} L ${xOf(Y1)} ${Y_BASE} L ${xOf(Y0)} ${Y_BASE} Z`;
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <svg viewBox="0 0 800 290" className="w-full min-w-[560px]" role="img" aria-labelledby="seasons-title seasons-desc">
        <title id="seasons-title">AI summers and winters, 1950 to today</title>
        <desc id="seasons-desc">
          An illustrative curve of enthusiasm and funding for AI: rising after 1956, falling in the mid-1970s first winter, rising
          with expert systems in the 1980s, falling again in the late 1980s second winter, then climbing steeply after 2012 and again after 2022.
        </desc>
        <defs>
          <linearGradient id="seasons-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--sage)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--sage)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {WINTERS.map((w) => (
          <g key={w.label}>
            <rect x={xOf(w.from)} y={30} width={xOf(w.to) - xOf(w.from)} height={Y_BASE - 30} fill="#9fc3e0" opacity="0.1" />
            <text x={(xOf(w.from) + xOf(w.to)) / 2} y={46} textAnchor="middle" fontSize="12" fontFamily={FONT} fill="#9fc3e0">
              ❄ {w.label}
            </text>
          </g>
        ))}

        <path d={area} fill="url(#seasons-fill)" />
        <path d={line} fill="none" stroke="var(--sage)" strokeWidth="2.5" strokeLinecap="round" />

        {MARKERS.map((m) => {
          const x = xOf(m.year);
          const y = yOf(m.level);
          const ty = m.up ? y - 18 : y + 26;
          return (
            <g key={m.label}>
              <circle cx={x} cy={y} r="5" fill="var(--bg)" stroke="var(--fg)" strokeWidth="2" />
              <text x={x} y={ty} textAnchor="middle" fontSize="12" fontFamily={FONT} fill="var(--fg)">
                {m.label}
              </text>
            </g>
          );
        })}

        <line x1={X0} x2={X1} y1={Y_BASE} y2={Y_BASE} stroke="var(--line)" />
        {[1950, 1970, 1990, 2010, 2026].map((yr) => (
          <text key={yr} x={xOf(yr)} y={Y_BASE + 22} textAnchor="middle" fontSize="12" fontFamily={FONT} fill="var(--fg)" opacity="0.5">
            {yr}
          </text>
        ))}
        <text x={X0} y={20} fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.5" letterSpacing="1.5">
          ENTHUSIASM &amp; FUNDING ↑
        </text>
      </svg>
    </div>
  );
}

/* ── Turing's imitation game ────────────────────────────────────────────── */

function Person({ x, y, label, sub }: { x: number; y: number; label: string; sub?: string }) {
  return (
    <g>
      <circle cx={x} cy={y - 26} r="14" fill="none" stroke="var(--fg)" strokeWidth="2" />
      <path d={`M ${x - 22} ${y + 18} Q ${x - 22} ${y - 6} ${x} ${y - 6} Q ${x + 22} ${y - 6} ${x + 22} ${y + 18}`} fill="none" stroke="var(--fg)" strokeWidth="2" />
      <text x={x} y={y + 40} textAnchor="middle" fontSize="13" fontFamily={FONT} fill="var(--fg)" fontWeight="600">{label}</text>
      {sub && <text x={x} y={y + 56} textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.55">{sub}</text>}
    </g>
  );
}

export function ImitationGame() {
  return (
    <svg viewBox="0 0 640 250" className="w-full" role="img" aria-labelledby="ig-title ig-desc">
      <title id="ig-title">Turing&apos;s imitation game</title>
      <desc id="ig-desc">
        A judge exchanges typed messages with two hidden players, A and B. One is a person, one is a machine. The judge has to say which is which.
      </desc>
      <Person x={90} y={140} label="Judge" sub="asks questions" />

      {/* wall */}
      <rect x="300" y="30" width="10" height="200" rx="3" fill="var(--line)" />
      <text x="305" y="22" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.5" letterSpacing="1.5">WALL</text>

      {/* message lines */}
      <g stroke="var(--sage)" strokeWidth="1.5" strokeDasharray="5 5" fill="none">
        <path d="M 130 110 C 230 70, 380 60, 460 75" />
        <path d="M 130 150 C 230 190, 380 195, 460 185" />
      </g>
      <g fontFamily={FONT} fontSize="12">
        <rect x="145" y="52" width="150" height="28" rx="14" fill="var(--card)" stroke="var(--line)" />
        <text x="220" y="70" textAnchor="middle" fill="var(--fg)">“Write me a sonnet”</text>
        <rect x="145" y="182" width="150" height="28" rx="14" fill="var(--card)" stroke="var(--line)" />
        <text x="220" y="200" textAnchor="middle" fill="var(--fg)">“Add 34957 to 70764”</text>
      </g>

      {/* hidden players */}
      <g>
        <rect x="440" y="40" width="160" height="70" rx="14" fill="var(--card)" stroke="var(--line)" />
        <text x="520" y="72" textAnchor="middle" fontSize="22" fontFamily={FONT} fill="var(--fg)" fontWeight="700">A</text>
        <text x="520" y="94" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.55">person or machine?</text>
        <rect x="440" y="150" width="160" height="70" rx="14" fill="var(--card)" stroke="var(--line)" />
        <text x="520" y="182" textAnchor="middle" fontSize="22" fontFamily={FONT} fill="var(--fg)" fontWeight="700">B</text>
        <text x="520" y="204" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.55">person or machine?</text>
      </g>
    </svg>
  );
}

/* ── Biological vs artificial neuron ────────────────────────────────────── */

export function NeuronDiagram() {
  const inputs = [60, 120, 180];
  return (
    <svg viewBox="0 0 640 240" className="w-full" role="img" aria-labelledby="neuron-title neuron-desc">
      <title id="neuron-title">An artificial neuron</title>
      <desc id="neuron-desc">
        Three inputs, each multiplied by a weight, are added together. If the total passes a threshold, the neuron fires and outputs 1; otherwise it outputs 0.
      </desc>
      {inputs.map((y, i) => (
        <g key={y}>
          <circle cx="60" cy={y} r="18" fill="var(--card)" stroke="var(--fg)" strokeWidth="1.5" />
          <text x="60" y={y + 4} textAnchor="middle" fontSize="12" fontFamily={FONT} fill="var(--fg)">in {i + 1}</text>
          <line x1="78" y1={y} x2="262" y2="120" stroke="var(--sage)" strokeWidth={[3.5, 1.5, 2.5][i]} />
          <text x={170} y={y + (120 - y) * 0.5 - 8} textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--sage)">
            weight
          </text>
        </g>
      ))}
      <circle cx="300" cy="120" r="38" fill="var(--card)" stroke="var(--fg)" strokeWidth="2" />
      <text x="300" y="128" textAnchor="middle" fontSize="26" fontFamily={FONT} fill="var(--fg)">Σ</text>
      <text x="300" y="186" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.6">add it all up</text>

      <line x1="338" y1="120" x2="400" y2="120" stroke="var(--fg)" strokeWidth="1.5" />
      <rect x="400" y="88" width="84" height="64" rx="12" fill="var(--card)" stroke="var(--fg)" strokeWidth="1.5" />
      <path d="M 414 136 L 440 136 L 440 104 L 470 104" fill="none" stroke="var(--sage)" strokeWidth="2.5" />
      <text x="442" y="186" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.6">over the threshold?</text>

      <line x1="484" y1="120" x2="548" y2="120" stroke="var(--fg)" strokeWidth="1.5" markerEnd="url(#neuron-arrow)" />
      <defs>
        <marker id="neuron-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fg)" />
        </marker>
      </defs>
      <text x="590" y="116" textAnchor="middle" fontSize="13" fontFamily={FONT} fill="var(--fg)" fontWeight="600">fire: 1</text>
      <text x="590" y="134" textAnchor="middle" fontSize="13" fontFamily={FONT} fill="var(--fg)" opacity="0.55">or not: 0</text>
    </svg>
  );
}

/* ── Rules vs learning ──────────────────────────────────────────────────── */

export function RulesVsLearning() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-line bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-1">1950s–1980s</p>
        <p className="font-tech text-lg font-semibold text-fg mb-4">Write the rules</p>
        <pre className="font-mono text-[12.5px] leading-relaxed text-fg/80 bg-card rounded-xl p-4 overflow-x-auto whitespace-pre">
{`IF has_whiskers
 AND has_pointy_ears
 AND says "meow"
THEN cat
ELSE ??? `}
        </pre>
        <p className="font-casual text-sm text-fg/60 mt-4 leading-relaxed">
          Humans spell out every case. Works in narrow domains — breaks on anything the rule-writer didn&apos;t foresee.
        </p>
      </div>
      <div className="rounded-2xl border border-sage/40 bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-1">1990s–today</p>
        <p className="font-tech text-lg font-semibold text-fg mb-4">Learn from examples</p>
        <div className="flex items-center gap-2 bg-card rounded-xl p-4 font-tech text-[12.5px] text-fg/80">
          <div className="grid grid-cols-3 gap-1 shrink-0" aria-hidden="true">
            {["🐱", "🐶", "🐱", "🐱", "🐶", "🐱"].map((e, i) => (
              <span key={i} className="w-7 h-7 rounded-md bg-bg flex items-center justify-center text-sm">{e}</span>
            ))}
          </div>
          <span className="text-fg/40" aria-hidden="true">→</span>
          <span className="rounded-lg border border-sage/50 px-2 py-1.5 text-center leading-tight">model<br /><span className="text-fg/45 text-[10px]">adjusts weights</span></span>
          <span className="text-fg/40" aria-hidden="true">→</span>
          <span className="leading-tight">“cat,<br />92% sure”</span>
        </div>
        <p className="font-casual text-sm text-fg/60 mt-4 leading-relaxed">
          Show thousands of labelled examples; the system finds the patterns itself. Needs lots of data and computing power.
        </p>
      </div>
    </div>
  );
}

/* ── The three ingredients of 2012 ──────────────────────────────────────── */

export function ThreeIngredients() {
  const items = [
    {
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <g fill="none" stroke="var(--sage)" strokeWidth="2">
            <ellipse cx="24" cy="12" rx="14" ry="5" />
            <path d="M10 12v12c0 2.8 6.3 5 14 5s14-2.2 14-5V12" />
            <path d="M10 24v12c0 2.8 6.3 5 14 5s14-2.2 14-5V24" />
          </g>
        </svg>
      ),
      title: "Data",
      body: "ImageNet's 1.2 million labelled training images gave networks enough examples to learn from.",
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <g fill="none" stroke="var(--sage)" strokeWidth="2">
            <rect x="10" y="10" width="28" height="28" rx="4" />
            <rect x="17" y="17" width="14" height="14" rx="2" />
            <path d="M16 4v6M24 4v6M32 4v6M16 38v6M24 38v6M32 38v6M4 16h6M4 24h6M4 32h6M38 16h6M38 24h6M38 32h6" />
          </g>
        </svg>
      ),
      title: "Compute",
      body: "Graphics cards built for video games turned out to be ideal for the maths of neural networks. AlexNet trained on two of them.",
    },
    {
      icon: (
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden="true">
          <g fill="none" stroke="var(--sage)" strokeWidth="2">
            <circle cx="8" cy="14" r="4" /><circle cx="8" cy="34" r="4" />
            <circle cx="24" cy="10" r="4" /><circle cx="24" cy="24" r="4" /><circle cx="24" cy="38" r="4" />
            <circle cx="40" cy="24" r="4" />
            <path d="M12 14l8-4M12 14l8 10M12 34l8-10M12 34l8 4M28 10l8 14M28 24h8M28 38l8-14" />
          </g>
        </svg>
      ),
      title: "Algorithms",
      body: "Deep, multi-layer networks trained with backpropagation — plus practical tricks to make them train faster and generalise better.",
    },
  ];
  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {items.map((it, i) => (
        <div key={it.title} className="relative rounded-2xl border border-line bg-bg p-5">
          {it.icon}
          <p className="font-tech text-lg font-semibold text-fg mt-3 mb-1.5">{it.title}</p>
          <p className="font-casual text-sm text-fg/65 leading-relaxed">{it.body}</p>
          {i < items.length - 1 && (
            <span className="hidden sm:flex absolute -right-[14px] top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-fg text-bg font-tech text-sm items-center justify-center" aria-hidden="true">+</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Hero art: a timeline ribbon ────────────────────────────────────────── */

export function HeroArt() {
  return (
    <svg
      viewBox="0 0 400 200"
      className="absolute right-0 -top-6 w-[260px] md:w-[440px] opacity-25 md:opacity-40 pointer-events-none"
      aria-hidden="true"
    >
      <path d={`M 0 170 C 60 170, 60 110, 100 120 S 150 180, 190 160 S 250 60, 300 70 S 360 10, 400 6`} fill="none" stroke="var(--sage)" strokeWidth="2" />
      {[[100, 120], [190, 160], [300, 70], [400, 6]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="6" fill="var(--bg)" stroke="var(--fg)" strokeWidth="2" />
      ))}
      <g fontFamily={FONT} fontSize="11" fill="var(--fg)">
        <text x="100" y="104" textAnchor="middle">1956</text>
        <text x="190" y="186" textAnchor="middle">1980s</text>
        <text x="300" y="54" textAnchor="middle">2012</text>
        <text x="386" y="30" textAnchor="end">today</text>
      </g>
    </svg>
  );
}
