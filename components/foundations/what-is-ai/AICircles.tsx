"use client";
import { useState, type ReactNode } from "react";

export type Ring = {
  id: string;
  label: string;
  short: string;
  definition: ReactNode;
  since: string;
  examples: string[];
  note?: ReactNode;
};

// Concentric-ish circles, each nested inside the last and nudged downward so labels fit.
const GEOMETRY = [
  { r: 190, cy: 200 },
  { r: 146, cy: 236 },
  { r: 104, cy: 272 },
  { r: 62, cy: 308 },
];

export default function AICircles({ rings }: { rings: Ring[] }) {
  const [active, setActive] = useState(rings[0].id);
  const current = rings.find((r) => r.id === active) ?? rings[0];

  return (
    <div className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-6 md:gap-8 items-center">
      <div>
        <svg viewBox="0 0 400 400" className="w-full max-w-[320px] mx-auto block" role="group" aria-label="Nested circles: AI contains machine learning, which contains deep learning, which contains today's generative AI">
          {rings.map((ring, i) => {
            const g = GEOMETRY[i];
            const on = ring.id === active;
            const labelY = g.cy - g.r + (i === 0 ? 40 : 26);
            return (
              <g
                key={ring.id}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={ring.label}
                onClick={() => setActive(ring.id)}
                onMouseEnter={() => setActive(ring.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(ring.id);
                  }
                }}
                className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-[3]"
              >
                <circle
                  cx="200"
                  cy={g.cy}
                  r={g.r}
                  fill={on ? "var(--sage)" : "var(--card)"}
                  fillOpacity={on ? 0.28 : 0.9}
                  stroke={on ? "var(--fg)" : "var(--sage)"}
                  strokeOpacity={on ? 1 : 0.55}
                  strokeWidth={on ? 2 : 1.5}
                  className="transition-all duration-300"
                />
                <text
                  x="200"
                  y={labelY}
                  textAnchor="middle"
                  fontSize={i === 0 ? 15 : i === 3 ? 16 : 17}
                  fontWeight="600"
                  fontFamily="var(--font-space-grotesk)"
                  fill="var(--fg)"
                  pointerEvents="none"
                >
                  {ring.short}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-2 text-center font-tech text-xs text-fg/45">Tap a circle</p>
      </div>

      <div className="rounded-2xl border border-line bg-bg p-5 sm:p-6 min-h-[300px]" aria-live="polite">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-2">{current.since}</p>
        <p className="font-tech text-2xl font-semibold text-fg mb-3">{current.label}</p>
        <div className="font-casual text-[16px] text-fg/80 leading-relaxed mb-4">{current.definition}</div>
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-2">Examples</p>
        <ul className="flex flex-wrap gap-2 mb-4">
          {current.examples.map((ex) => (
            <li key={ex} className="font-tech text-xs text-fg/75 border border-line rounded-full px-3 py-1">
              {ex}
            </li>
          ))}
        </ul>
        {current.note && <div className="font-casual text-sm text-fg/60 leading-relaxed border-t border-line pt-3">{current.note}</div>}
      </div>
    </div>
  );
}
