"use client";
import { useState } from "react";

/* Before vs after: a voice assistant built from three chained models, versus one natively multimodal model.
   Figures from OpenAI's GPT-4o announcement (May 2024). */

const MODES = {
  chained: {
    label: "Three models chained",
    when: "Voice assistants before 2024",
    steps: [
      { t: "🎤 Your voice", k: "in" },
      { t: "Speech → text model", k: "box" },
      { t: "plain text only", k: "wire" },
      { t: "Language model", k: "box main" },
      { t: "plain text only", k: "wire" },
      { t: "Text → speech model", k: "box" },
      { t: "🔊 Reply", k: "out" },
    ],
    stat: "≈ 2.8–5.4 s",
    statNote: "average reply time in ChatGPT's earlier Voice Mode",
    lost: ["Tone of voice", "Who is speaking", "Anything that isn't words"],
  },
  native: {
    label: "One multimodal model",
    when: "Since GPT-4o (May 2024) and similar models",
    steps: [
      { t: "🎤 Your voice", k: "in" },
      { t: "One model hears, thinks and speaks", k: "box main wide" },
      { t: "🔊 Reply", k: "out" },
    ],
    stat: "≈ 0.32 s",
    statNote: "average audio response time reported for GPT-4o — close to human conversation",
    lost: [],
  },
} as const;
type Mode = keyof typeof MODES;

export default function PipelineCompare() {
  const [mode, setMode] = useState<Mode>("chained");
  const m = MODES[mode];

  return (
    <div>
      <div role="group" aria-label="Compare approaches" className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(MODES) as Mode[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={mode === k}
            onClick={() => setMode(k)}
            className={`font-tech text-sm px-4 py-2 rounded-full border transition-colors ${
              mode === k ? "bg-fg text-bg border-fg" : "border-line text-fg/70 hover:border-fg/40"
            }`}
          >
            {MODES[k].label}
          </button>
        ))}
      </div>

      <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-3">{m.when}</p>

      <ol className="flex flex-col md:flex-row md:items-stretch gap-2 mb-6" aria-live="polite">
        {m.steps.map((s, i) => {
          const wire = s.k === "wire";
          const main = s.k.includes("main");
          return (
            <li
              key={i}
              className={`flex items-center justify-center text-center font-tech text-sm rounded-xl px-3 py-3 ${
                wire
                  ? "text-[11px] text-[#e3a08a] border border-dashed border-[#e3a08a]/50 md:max-w-[92px]"
                  : s.k === "in" || s.k === "out"
                    ? "text-fg/80 bg-card md:max-w-[110px]"
                    : main
                      ? `bg-sage/20 border border-sage/60 text-fg font-semibold ${s.k.includes("wide") ? "md:flex-[3]" : ""}`
                      : "border border-line text-fg/80"
              } md:flex-1`}
            >
              {s.t}
            </li>
          );
        })}
      </ol>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-bg p-5">
          <p className="font-tech text-3xl font-bold text-fg tabular-nums mb-1">{m.stat}</p>
          <p className="font-casual text-sm text-fg/60 leading-relaxed">{m.statNote}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${m.lost.length ? "border-[#e3a08a]/40" : "border-sage/50"} bg-bg`}>
          {m.lost.length ? (
            <>
              <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-[#e3a08a] mb-2">Lost along the way</p>
              <ul className="space-y-1">
                {m.lost.map((l) => (
                  <li key={l} className="font-casual text-sm text-fg/75">✗ {l}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mb-2">Kept</p>
              <p className="font-casual text-sm text-fg/75 leading-relaxed">
                The model hears the audio itself, so tone and different voices reach the part that does the thinking.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
