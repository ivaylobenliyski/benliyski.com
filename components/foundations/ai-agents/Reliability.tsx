"use client";
import { useState } from "react";

/* Why long tasks are hard: if every step must succeed, success rates multiply. */

const PRESETS = [
  { label: "Quick lookup", steps: 3 },
  { label: "Book a trip", steps: 15 },
  { label: "Fix a bug", steps: 40 },
];

export default function Reliability() {
  const [perStep, setPerStep] = useState(95);
  const [steps, setSteps] = useState(15);
  const overall = Math.pow(perStep / 100, steps) * 100;

  return (
    <div className="grid md:grid-cols-[1fr_1fr] gap-6 items-center">
      <div className="space-y-5">
        <label className="block">
          <span className="flex justify-between font-tech text-sm text-fg/70 mb-1.5">
            <span>Each step succeeds</span>
            <span className="tabular-nums text-fg">{perStep.toFixed(perStep % 1 ? 1 : 0)}%</span>
          </span>
          <input type="range" min={80} max={99.9} step={0.1} value={perStep} onChange={(e) => setPerStep(Number(e.target.value))} className="w-full accent-[var(--sage)] h-6" />
        </label>
        <label className="block">
          <span className="flex justify-between font-tech text-sm text-fg/70 mb-1.5">
            <span>Steps in the task</span>
            <span className="tabular-nums text-fg">{steps}</span>
          </span>
          <input type="range" min={1} max={60} step={1} value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="w-full accent-[var(--sage)] h-6" />
        </label>
        <div role="group" aria-label="Example tasks" className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setSteps(p.steps)}
              aria-pressed={steps === p.steps}
              className={`font-tech text-xs px-3 py-1.5 rounded-full border transition-colors ${
                steps === p.steps ? "bg-fg text-bg border-fg" : "border-line text-fg/70 hover:border-fg/40"
              }`}
            >
              {p.label} · {p.steps} steps
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-bg p-5" aria-live="polite">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-1">Whole task succeeds</p>
        <p className={`font-tech text-5xl font-bold tabular-nums mb-3 ${overall >= 70 ? "text-sage" : overall >= 30 ? "text-[#d9b98a]" : "text-[#e3a08a]"}`}>
          {overall < 1 ? overall.toFixed(1) : Math.round(overall)}%
        </p>
        <div className="h-3 rounded-full bg-line overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${overall >= 70 ? "bg-sage" : overall >= 30 ? "bg-[#d9b98a]" : "bg-[#e3a08a]"}`}
            style={{ width: `${Math.max(0.5, overall)}%` }}
          />
        </div>
        <p className="font-casual text-sm text-fg/60 leading-relaxed">
          {perStep.toFixed(perStep % 1 ? 1 : 0)}% reliable, {steps} time{steps === 1 ? "" : "s"} in a row. Small error rates add up fast — which is why agents
          need to check their work and recover from mistakes.
        </p>
      </div>
    </div>
  );
}
