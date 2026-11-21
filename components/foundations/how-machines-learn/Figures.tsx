/* Static illustrations for the "How machines learn" guide. */

const FONT = "var(--font-space-grotesk)";

/* ── The learning loop ──────────────────────────────────────────────────── */

const LOOP = [
  { n: "Guess", d: "Make a prediction for an example", x: 200, y: 40 },
  { n: "Compare", d: "Measure how wrong it was (the “loss”)", x: 340, y: 150 },
  { n: "Adjust", d: "Nudge every weight to be a bit less wrong", x: 200, y: 260 },
  { n: "Repeat", d: "Millions or billions of times", x: 60, y: 150 },
];

export function LearningLoop() {
  return (
    <div className="grid md:grid-cols-[1.2fr_1fr] gap-6 items-center">
    <svg viewBox="0 0 400 300" className="w-full max-w-[420px] mx-auto block" role="img" aria-labelledby="loop-t loop-d">
      <title id="loop-t">The training loop</title>
      <desc id="loop-d">Guess, compare with the right answer, adjust the weights, and repeat — over and over.</desc>
      <defs>
        <marker id="loop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--sage)" />
        </marker>
      </defs>
      <circle cx="200" cy="150" r="110" fill="none" stroke="var(--line)" strokeWidth="1.5" />
      {[
        "M 262 62 A 110 110 0 0 1 300 104",
        "M 300 196 A 110 110 0 0 1 262 238",
        "M 138 238 A 110 110 0 0 1 100 196",
        "M 100 104 A 110 110 0 0 1 138 62",
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke="var(--sage)" strokeWidth="2.5" markerEnd="url(#loop-arrow)" />
      ))}
      {LOOP.map((s) => (
        <g key={s.n}>
          <rect x={s.x - 58} y={s.y - 24} width="116" height="48" rx="14" fill="var(--bg)" stroke="var(--fg)" strokeWidth="1.5" />
          <text x={s.x} y={s.y + 6} textAnchor="middle" fontSize="17" fontWeight="600" fontFamily={FONT} fill="var(--fg)">{s.n}</text>
        </g>
      ))}
      <text x="200" y="146" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.5" letterSpacing="1.5">TRAINING</text>
      <text x="200" y="162" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.5" letterSpacing="1.5">LOOP</text>
    </svg>
    <ul className="space-y-3">
      {LOOP.map((s) => (
        <li key={s.n} className="flex gap-3">
          <span className="font-tech text-sm font-semibold text-sage w-20 shrink-0">{s.n}</span>
          <span className="font-casual text-sm text-fg/70 leading-relaxed">{s.d}</span>
        </li>
      ))}
    </ul>
    </div>
  );
}

/* ── Kinds of learning ──────────────────────────────────────────────────── */

const KINDS = [
  {
    name: "Supervised",
    tag: "Learn from labelled answers",
    how: "Shown examples with the right answer attached: this email is spam, this one isn't.",
    used: "Spam filters, medical image screening, price prediction",
    icon: "M8 12l3 3 6-6",
  },
  {
    name: "Unsupervised",
    tag: "Find hidden structure",
    how: "No answers given. The model groups similar things or spots what's unusual.",
    used: "Customer segments, fraud and anomaly detection",
    icon: "M6 8h.01M9 6h.01M8 11h.01M16 14h.01M18 17h.01M15 18h.01",
  },
  {
    name: "Self-supervised",
    tag: "Make the answers from the data",
    how: "Hide part of the data and predict it — like guessing the next word in a sentence. Unlimited practice, no human labels needed.",
    used: "How large language models are pre-trained",
    icon: "M5 12h3M10 12h4M16 12h.01M19 12h.01",
  },
  {
    name: "Reinforcement",
    tag: "Learn by trial and reward",
    how: "Try actions, get a reward or penalty, and gradually favour what works.",
    used: "Game-playing (AlphaGo), robotics, tuning chatbots and reasoning models",
    icon: "M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z",
  },
];

export function KindsOfLearning() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {KINDS.map((k) => (
        <div key={k.name} className="rounded-2xl border border-line bg-bg p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-xl border border-sage/50 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="var(--sage)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={k.icon} />
              </svg>
            </span>
            <div>
              <p className="font-tech font-semibold text-fg leading-tight">{k.name}</p>
              <p className="font-tech text-xs text-sage">{k.tag}</p>
            </div>
          </div>
          <p className="font-casual text-sm text-fg/75 leading-relaxed mb-3">{k.how}</p>
          <p className="font-tech text-xs text-fg/50 leading-relaxed">
            <span className="uppercase tracking-[0.12em] text-fg/40 mr-1.5">Used for</span>
            {k.used}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── A neural network, layer by layer ──────────────────────────────────── */

const LAYERS = [
  { n: 4, label: "Pixels", sub: "input" },
  { n: 5, label: "Edges", sub: "layer 1" },
  { n: 5, label: "Textures & shapes", sub: "middle layers" },
  { n: 4, label: "Parts", sub: "e.g. ears, eyes" },
  { n: 2, label: "“Cat”", sub: "output" },
];

export function LayeredNetwork() {
  const colX = (i: number) => 50 + i * 135;
  const rowY = (j: number, n: number) => 130 + (j - (n - 1) / 2) * 40;
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <svg viewBox="0 0 640 300" className="w-full min-w-[520px]" role="img" aria-labelledby="net-t net-d">
        <title id="net-t">A layered neural network</title>
        <desc id="net-d">
          Image pixels flow through layers of artificial neurons. Early layers respond to edges, middle layers to textures and shapes, later layers to
          object parts, and the output says what the image shows.
        </desc>
        <g stroke="var(--sage)" strokeOpacity="0.28" strokeWidth="1">
          {LAYERS.slice(0, -1).map((L, i) =>
            Array.from({ length: L.n }).flatMap((_, a) =>
              Array.from({ length: LAYERS[i + 1].n }).map((__, b) => (
                <line key={`${i}-${a}-${b}`} x1={colX(i)} y1={rowY(a, L.n)} x2={colX(i + 1)} y2={rowY(b, LAYERS[i + 1].n)} />
              )),
            ),
          )}
        </g>
        {LAYERS.map((L, i) => (
          <g key={L.label}>
            {Array.from({ length: L.n }).map((_, j) => (
              <circle
                key={j}
                cx={colX(i)}
                cy={rowY(j, L.n)}
                r="11"
                fill={i === LAYERS.length - 1 && j === 0 ? "var(--sage)" : "var(--bg)"}
                stroke="var(--fg)"
                strokeWidth="1.5"
              />
            ))}
            <text x={colX(i)} y="262" textAnchor="middle" fontSize="13" fontWeight="600" fontFamily={FONT} fill="var(--fg)">{L.label}</text>
            <text x={colX(i)} y="280" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.5">{L.sub}</text>
          </g>
        ))}
        <text x="590" y="88" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.6">cat 0.94</text>
        <text x="590" y="178" textAnchor="middle" fontSize="11" fontFamily={FONT} fill="var(--fg)" opacity="0.6">dog 0.06</text>
        <g fontFamily={FONT} fontSize="11" fill="var(--sage)">
          <text x="50" y="22" textAnchor="start">data flows forward →</text>
          <text x="590" y="296" textAnchor="end" opacity="0">.</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Underfit / good fit / overfit ──────────────────────────────────────── */

const PTS: [number, number][] = [
  [10, 78], [22, 60], [34, 56], [46, 40], [58, 46], [70, 30], [82, 34], [94, 22],
];

function FitPanel({ title, verdict, good, path }: { title: string; verdict: string; good: boolean; path: string }) {
  return (
    <div className="rounded-2xl border border-line bg-bg p-4">
      <svg viewBox="0 0 104 92" className="w-full" aria-hidden="true">
        <rect x="2" y="2" width="100" height="88" rx="6" fill="none" stroke="var(--line)" />
        <path d={path} fill="none" stroke={good ? "var(--sage)" : "#e3a08a"} strokeWidth="2" strokeLinecap="round" />
        {PTS.map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="2.6" fill="var(--fg)" />
        ))}
      </svg>
      <p className="font-tech font-semibold text-fg mt-3">{title}</p>
      <p className={`font-tech text-xs mt-0.5 ${good ? "text-sage" : "text-[#e3a08a]"}`}>{verdict}</p>
    </div>
  );
}

export function FitComparison() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <FitPanel title="Too simple" verdict="Misses the pattern (underfitting)" good={false} path="M 4 50 L 100 50" />
      <FitPanel title="Just right" verdict="Captures the trend, ignores the noise" good path="M 4 80 C 40 52, 60 38, 100 22" />
      <FitPanel
        title="Memorised"
        verdict="Hits every dot, fails on new ones (overfitting)"
        good={false}
        path="M 6 84 L 10 78 C 16 60, 18 56, 22 60 C 28 66, 30 50, 34 56 C 40 64, 42 32, 46 40 C 50 48, 54 52, 58 46 C 62 40, 66 22, 70 30 C 74 38, 78 40, 82 34 C 86 28, 90 16, 94 22 L 100 30"
      />
    </div>
  );
}

/* ── Training vs using ──────────────────────────────────────────────────── */

export function TrainVsUse() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-2xl border border-line bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-1">Once, up front</p>
        <p className="font-tech text-lg font-semibold text-fg mb-3">Training</p>
        <ul className="space-y-2 font-casual text-sm text-fg/75 leading-relaxed">
          <li>Runs the learning loop over huge amounts of data</li>
          <li>Changes the model&apos;s weights</li>
          <li>For the largest models: thousands of chips, weeks or months</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-sage/50 bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-1">Every time you ask</p>
        <p className="font-tech text-lg font-semibold text-fg mb-3">Using it (“inference”)</p>
        <ul className="space-y-2 font-casual text-sm text-fg/75 leading-relaxed">
          <li>Runs your input forward through the finished model</li>
          <li>Weights stay fixed — it isn&apos;t learning from you right now</li>
          <li>Takes milliseconds to seconds</li>
        </ul>
      </div>
    </div>
  );
}

/* ── Hero art ───────────────────────────────────────────────────────────── */

export function HeroArt() {
  return (
    <svg viewBox="0 0 300 220" className="absolute -right-4 -top-8 w-[210px] md:w-[360px] opacity-20 md:opacity-35 pointer-events-none" aria-hidden="true">
      <polyline points="10,30 50,90 90,130 130,150 170,170 210,180 250,186 290,189" fill="none" stroke="var(--sage)" strokeWidth="2" />
      {[[10, 30], [50, 90], [90, 130], [130, 150], [170, 170], [210, 180], [250, 186], [290, 189]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="4" fill="var(--bg)" stroke="var(--fg)" strokeWidth="1.5" />
      ))}
      <text x="10" y="18" fontFamily={FONT} fontSize="11" fill="var(--fg)">error</text>
      <text x="290" y="210" textAnchor="end" fontFamily={FONT} fontSize="11" fill="var(--fg)">training steps →</text>
    </svg>
  );
}
