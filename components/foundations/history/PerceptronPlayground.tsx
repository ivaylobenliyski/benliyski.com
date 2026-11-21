"use client";
import { useMemo, useState } from "react";

type Target = "AND" | "OR" | "XOR";

const TARGETS: Record<Target, { fn: (a: number, b: number) => number; hint: string }> = {
  AND: { fn: (a, b) => a & b, hint: "Fire only when both inputs are on." },
  OR: { fn: (a, b) => a | b, hint: "Fire when at least one input is on." },
  XOR: { fn: (a, b) => a ^ b, hint: "Fire when exactly one input is on — but not both." },
};

const ROWS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

// Plot domain for the decision-boundary picture.
const MIN = -0.5;
const MAX = 1.5;
const CELLS = 24;

function Slider({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <label className="block">
      <span className="flex justify-between font-tech text-sm text-fg/70 mb-1.5">
        <span>{label}</span>
        <span className="tabular-nums text-fg">{value.toFixed(1)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--sage)] h-6"
      />
    </label>
  );
}

export default function PerceptronPlayground() {
  const [w1, setW1] = useState(0.5);
  const [w2, setW2] = useState(0.5);
  const [theta, setTheta] = useState(2);
  const [target, setTarget] = useState<Target>("AND");

  const fire = (a: number, b: number) => (w1 * a + w2 * b >= theta ? 1 : 0);
  const correct = ROWS.filter(([a, b]) => fire(a, b) === TARGETS[target].fn(a, b)).length;
  const solved = correct === 4;

  const cells = useMemo(() => {
    const size = (MAX - MIN) / CELLS;
    const out: { x: number; y: number; on: boolean }[] = [];
    for (let i = 0; i < CELLS; i++)
      for (let j = 0; j < CELLS; j++) {
        const x = MIN + (i + 0.5) * size;
        const y = MIN + (j + 0.5) * size;
        out.push({ x: i, y: j, on: w1 * x + w2 * y >= theta });
      }
    return out;
  }, [w1, w2, theta]);

  // map data coords → svg coords (0..200), y flipped
  const sx = (v: number) => ((v - MIN) / (MAX - MIN)) * 200;
  const sy = (v: number) => 200 - ((v - MIN) / (MAX - MIN)) * 200;

  return (
    <div className="grid lg:grid-cols-[1fr_1fr] gap-6 lg:gap-10">
      <div>
        <div role="group" aria-label="Pick a pattern to learn" className="flex gap-2 mb-2">
          {(Object.keys(TARGETS) as Target[]).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={target === t}
              onClick={() => setTarget(t)}
              className={`font-tech text-sm px-4 py-2 rounded-full border transition-colors ${
                target === t ? "bg-fg text-bg border-fg" : "border-line text-fg/70 hover:border-fg/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="font-casual text-sm text-fg/60 mb-5">{TARGETS[target].hint}</p>

        <div className="space-y-4 mb-6">
          <Slider label="Weight of input A" value={w1} onChange={setW1} min={-2} max={2} />
          <Slider label="Weight of input B" value={w2} onChange={setW2} min={-2} max={2} />
          <Slider label="Threshold to fire" value={theta} onChange={setTheta} min={-2} max={3} />
        </div>

        <table className="w-full font-tech text-sm">
          <caption className="sr-only">Perceptron output for every input combination</caption>
          <thead>
            <tr className="text-fg/45 text-xs uppercase tracking-[0.12em]">
              <th className="text-left font-normal pb-2">A</th>
              <th className="text-left font-normal pb-2">B</th>
              <th className="text-left font-normal pb-2">Sum</th>
              <th className="text-left font-normal pb-2">Fires?</th>
              <th className="text-left font-normal pb-2">Goal</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([a, b]) => {
              const out = fire(a, b);
              const goal = TARGETS[target].fn(a, b);
              const ok = out === goal;
              return (
                <tr key={`${a}${b}`} className="border-t border-line">
                  <td className="py-2">{a}</td>
                  <td className="py-2">{b}</td>
                  <td className="py-2 tabular-nums text-fg/60">{(w1 * a + w2 * b).toFixed(1)}</td>
                  <td className="py-2">{out}</td>
                  <td className={`py-2 ${ok ? "text-sage" : "text-[#e3a08a]"}`}>
                    {goal} {ok ? "✓" : "✗"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="mt-4 font-casual text-[15px] leading-relaxed min-h-[3.5rem]" aria-live="polite">
          {solved ? (
            <span className="text-sage">Solved — the perceptron gets all four right.</span>
          ) : target === "XOR" ? (
            <span className="text-fg/75">
              <strong className="text-fg">{correct}/4 right.</strong> Keep trying… but you won&apos;t get 4. No single straight line can separate
              these points. That&apos;s the limit Minsky and Papert proved in 1969 — and why multi-layer networks matter.
            </span>
          ) : (
            <span className="text-fg/70">{correct}/4 right. Adjust the sliders.</span>
          )}
        </p>
      </div>

      <div>
        <svg viewBox="-24 -8 236 236" className="w-full max-w-[360px] mx-auto block" role="img" aria-label="Decision boundary: the shaded area is where the perceptron fires">
          {cells.map((c) => (
            <rect
              key={`${c.x}-${c.y}`}
              x={(c.x * 200) / CELLS}
              y={200 - ((c.y + 1) * 200) / CELLS}
              width={200 / CELLS + 0.3}
              height={200 / CELLS + 0.3}
              fill={c.on ? "var(--sage)" : "transparent"}
              opacity={0.22}
            />
          ))}
          <rect x="0" y="0" width="200" height="200" fill="none" stroke="var(--line)" />
          {/* axes labels */}
          <text x="100" y="222" textAnchor="middle" fontSize="10" fill="var(--fg)" opacity="0.5" fontFamily="var(--font-space-grotesk)">input A →</text>
          <text x="-12" y="100" textAnchor="middle" fontSize="10" fill="var(--fg)" opacity="0.5" fontFamily="var(--font-space-grotesk)" transform="rotate(-90 -12 100)">input B →</text>
          {ROWS.map(([a, b]) => {
            const goal = TARGETS[target].fn(a, b);
            const ok = fire(a, b) === goal;
            return (
              <g key={`${a}${b}`}>
                <circle
                  cx={sx(a)}
                  cy={sy(b)}
                  r="11"
                  fill={goal ? "var(--fg)" : "var(--bg)"}
                  stroke={ok ? "var(--fg)" : "#e3a08a"}
                  strokeWidth={ok ? 1.5 : 3}
                />
                <text x={sx(a)} y={sy(b) + 3.5} textAnchor="middle" fontSize="10" fontFamily="var(--font-space-grotesk)" fill={goal ? "var(--bg)" : "var(--fg)"}>
                  {goal}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-3 font-tech text-xs text-fg/50 text-center max-w-[360px] mx-auto leading-relaxed">
          Shaded = where the perceptron fires. Filled dots should be inside the shade, hollow dots outside. The edge of the shade is
          always a straight line.
        </p>
      </div>
    </div>
  );
}
