/* Static illustrations for the "Vision models" guide. */
import { HEART, SIZE, seeded } from "./image";

const FONT = "var(--font-space-grotesk)";

/* ── Four jobs vision models do ─────────────────────────────────────────── */

function Scene({ children }: { children?: React.ReactNode }) {
  // A simple "photo": ground, sun, a cat-ish blob and a tree.
  return (
    <svg viewBox="0 0 120 84" className="w-full rounded-lg" aria-hidden="true">
      <rect width="120" height="84" fill="#20443b" />
      <rect y="60" width="120" height="24" fill="#2b5146" />
      <circle cx="100" cy="16" r="8" fill="#d9b98a" opacity="0.8" />
      <rect x="18" y="30" width="6" height="32" fill="#a89880" />
      <circle cx="21" cy="26" r="13" fill="#9DBFA8" opacity="0.8" />
      <ellipse cx="68" cy="58" rx="18" ry="11" fill="#F3E9D7" opacity="0.9" />
      <circle cx="84" cy="46" r="8" fill="#F3E9D7" opacity="0.9" />
      <path d="M79 40 l2 -7 l3 6 M86 39 l3 -6 l1 7" fill="#F3E9D7" />
      {children}
    </svg>
  );
}

const TASKS = [
  {
    name: "Classification",
    q: "What is in this picture?",
    eg: "Photo search, sorting products, spotting disease in scans",
    overlay: (
      <g>
        <rect x="4" y="4" width="44" height="14" rx="4" fill="#16302B" opacity="0.85" />
        <text x="26" y="14" textAnchor="middle" fontSize="8" fontFamily={FONT} fill="#F3E9D7">cat · 94%</text>
      </g>
    ),
  },
  {
    name: "Detection",
    q: "What is where?",
    eg: "Self-driving cars, security cameras, counting stock on shelves",
    overlay: (
      <g fill="none" strokeWidth="1.5">
        <rect x="47" y="35" width="47" height="37" stroke="#9DBFA8" />
        <rect x="6" y="11" width="30" height="52" stroke="#d9b98a" />
        <text x="48" y="33" fontSize="7" fontFamily={FONT} fill="#9DBFA8">cat</text>
        <text x="7" y="9" fontSize="7" fontFamily={FONT} fill="#d9b98a">tree</text>
      </g>
    ),
  },
  {
    name: "Segmentation",
    q: "Exactly which pixels belong to what?",
    eg: "Portrait mode on phones, medical image outlines, photo editing",
    overlay: (
      <g opacity="0.65">
        <ellipse cx="68" cy="58" rx="18" ry="11" fill="#e3a08a" />
        <circle cx="84" cy="46" r="8" fill="#e3a08a" />
        <circle cx="21" cy="26" r="13" fill="#9fc3e0" />
        <rect x="18" y="30" width="6" height="32" fill="#9fc3e0" />
      </g>
    ),
  },
  {
    name: "Generation",
    q: "Draw a picture from a description",
    eg: "Image generators, photo fill and editing, design mock-ups",
    overlay: (
      <g>
        <rect x="4" y="66" width="112" height="14" rx="4" fill="#16302B" opacity="0.85" />
        <text x="60" y="76" textAnchor="middle" fontSize="7" fontFamily={FONT} fill="#F3E9D7">“a cat in a garden at sunset”</text>
      </g>
    ),
  },
];

export function VisionTasks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {TASKS.map((t) => (
        <div key={t.name} className="rounded-2xl border border-line bg-bg p-4">
          <Scene>{t.overlay}</Scene>
          <p className="font-tech font-semibold text-fg mt-3">{t.name}</p>
          <p className="font-casual text-sm text-fg/80 italic mb-1.5">{t.q}</p>
          <p className="font-tech text-xs text-fg/50 leading-relaxed">{t.eg}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Pixel helper ───────────────────────────────────────────────────────── */

function PixelImage({ img, size, x = 0, y = 0, gap = 0 }: { img: number[][]; size: number; x?: number; y?: number; gap?: number }) {
  const cell = size / SIZE;
  return (
    <g>
      {img.flatMap((row, r) =>
        row.map((v, c) => {
          const gx = Math.floor(c / 4) * gap;
          const gy = Math.floor(r / 4) * gap;
          return <rect key={`${r}-${c}`} x={x + c * cell + gx} y={y + r * cell + gy} width={cell + 0.2} height={cell + 0.2} fill={`rgb(${v},${v},${v})`} />;
        }),
      )}
    </g>
  );
}

/* ── Vision transformer: image → patches → tokens ───────────────────────── */

export function PatchesFigure() {
  const patch = (pr: number, pc: number) =>
    HEART.slice(pr * 4, pr * 4 + 4).map((row) => row.slice(pc * 4, pc * 4 + 4));
  const order = Array.from({ length: 16 }, (_, i) => [Math.floor(i / 4), i % 4] as const);
  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <svg viewBox="0 0 640 230" className="w-full min-w-[560px]" role="img" aria-labelledby="vit-t vit-d">
        <title id="vit-t">How a vision transformer reads an image</title>
        <desc id="vit-d">The image is cut into a grid of 16 square patches, which are lined up in a row like words in a sentence and fed to a transformer.</desc>
        <PixelImage img={HEART} size={140} x={10} y={40} />
        <text x="80" y="200" textAnchor="middle" fontSize="12" fontFamily={FONT} fill="var(--fg)" opacity="0.6">image</text>
        <path d="M 162 110 h 26" stroke="var(--fg)" strokeOpacity="0.4" strokeWidth="2" markerEnd="url(#vit-a)" />
        <PixelImage img={HEART} size={140} x={200} y={34} gap={4} />
        <text x="276" y="200" textAnchor="middle" fontSize="12" fontFamily={FONT} fill="var(--fg)" opacity="0.6">16 patches</text>
        <path d="M 360 110 h 26" stroke="var(--fg)" strokeOpacity="0.4" strokeWidth="2" markerEnd="url(#vit-a)" />
        {order.map(([pr, pc], i) => {
          const px = 396 + (i % 8) * 29;
          const py = 70 + Math.floor(i / 8) * 46;
          const p = patch(pr, pc);
          const cell = 26 / p.length;
          return (
            <g key={i}>
              {p.flatMap((row, r) =>
                row.map((v, c) => <rect key={`${r}-${c}`} x={px + c * cell} y={py + r * cell} width={cell + 0.2} height={cell + 0.2} fill={`rgb(${v},${v},${v})`} />),
              )}
              <rect x={px} y={py} width="26" height="26" fill="none" stroke="var(--sage)" strokeWidth="1" />
            </g>
          );
        })}
        <text x="512" y="200" textAnchor="middle" fontSize="12" fontFamily={FONT} fill="var(--fg)" opacity="0.6">a sequence of “visual tokens” → transformer</text>
        <defs>
          <marker id="vit-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--fg)" fillOpacity="0.5" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ── Diffusion: noise → picture ─────────────────────────────────────────── */

export function DiffusionStrip() {
  const levels = [1, 0.75, 0.5, 0.25, 0];
  const frames = levels.map((lvl, i) => {
    const rnd = seeded(7 + i * 101);
    return HEART.map((row) => row.map((v) => Math.round(Math.min(255, Math.max(0, (1 - lvl) * v + lvl * rnd() * 255)))));
  });
  return (
    <div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {frames.map((img, i) => (
          <div key={i}>
            <svg viewBox="0 0 100 100" className="w-full rounded-md" aria-hidden="true">
              <PixelImage img={img} size={100} />
            </svg>
            <p className="mt-1.5 text-center font-tech text-[10px] sm:text-xs text-fg/50">
              {i === 0 ? "pure noise" : i === frames.length - 1 ? "picture" : `step ${i}`}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 font-tech text-xs text-fg/45 sr-only">Five frames going from random noise to a clear heart.</p>
    </div>
  );
}

/* ── How vision models get fooled ───────────────────────────────────────── */

export function FooledFigure() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-2xl border border-line bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-[#e3a08a] mb-3">Invisible noise</p>
        <div className="flex items-center gap-2 font-tech text-sm text-fg mb-3 flex-wrap">
          <span className="rounded-lg border border-line px-2.5 py-1.5">panda · 57.7%</span>
          <span className="text-fg/40">+ tiny noise =</span>
          <span className="rounded-lg border border-[#e3a08a]/60 px-2.5 py-1.5">gibbon · 99.3%</span>
        </div>
        <p className="font-casual text-sm text-fg/65 leading-relaxed">
          To a person the two photos look identical. A carefully calculated pattern of noise flipped the model&apos;s answer.
        </p>
      </div>
      <div className="rounded-2xl border border-line bg-bg p-5">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-[#e3a08a] mb-3">Texture over shape</p>
        <div className="flex items-center gap-2 font-tech text-sm text-fg mb-3 flex-wrap">
          <span className="rounded-lg border border-line px-2.5 py-1.5">cat shape + elephant skin</span>
          <span className="text-fg/40">→</span>
          <span className="rounded-lg border border-[#e3a08a]/60 px-2.5 py-1.5">“Indian elephant” · 63.9%</span>
        </div>
        <p className="font-casual text-sm text-fg/65 leading-relaxed">
          People go by shape and say “cat”. Standard image models trained on ImageNet leaned on texture instead.
        </p>
      </div>
    </div>
  );
}

/* ── Hero art ───────────────────────────────────────────────────────────── */

export function HeroArt() {
  return (
    <svg viewBox="0 0 140 140" className="absolute -right-2 -top-8 w-[170px] md:w-[290px] opacity-25 md:opacity-40 pointer-events-none" aria-hidden="true">
      <PixelImage img={HEART} size={140} />
    </svg>
  );
}
