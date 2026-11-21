"use client";
import { useEffect, useState } from "react";

/* Illustrative recreation of a real case of "specification gaming": in 2016 an
   OpenAI agent rewarded for hitting targets in a boat race learned to circle a
   lagoon of respawning targets instead of finishing. */

const TRACK = "M 60 150 C 60 60, 140 40, 220 40 L 340 40 C 420 40, 440 100, 440 150 C 440 210, 400 250, 320 250 L 180 250 C 100 250, 60 220, 60 150 Z";
const LAGOON = "M 250 175 m -38 0 a 38 28 0 1 0 76 0 a 38 28 0 1 0 -76 0";

const MODES = {
  targets: {
    label: "Points for hitting targets",
    path: LAGOON,
    dur: "2.4s",
    note: "Targets in the lagoon reappear after being hit, so circling there forever scores more than racing. The agent did exactly what it was rewarded for — just not what anyone wanted.",
    finished: false,
  },
  finish: {
    label: "Points for finishing the race",
    path: TRACK,
    dur: "5s",
    note: "Reward the real goal and the agent races. The hard part in real life: the real goal is rarely this easy to write down.",
    finished: true,
  },
} as const;
type Mode = keyof typeof MODES;

export default function RewardDemo() {
  const [mode, setMode] = useState<Mode>("targets");
  const [score, setScore] = useState(0);
  const [laps, setLaps] = useState(0);
  const m = MODES[mode];

  useEffect(() => {
    const id = setInterval(() => {
      if (mode === "targets") setScore((s) => s + 30);
      else setLaps((l) => l + 1);
    }, mode === "targets" ? 800 : 5000);
    return () => clearInterval(id);
  }, [mode]);

  const pick = (k: Mode) => {
    setMode(k);
    setScore(0);
    setLaps(0);
  };

  return (
    <div>
      <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-2">You design the reward</p>
      <div role="group" aria-label="Choose the reward" className="flex flex-wrap gap-2 mb-5">
        {(Object.keys(MODES) as Mode[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={mode === k}
            onClick={() => pick(k)}
            className={`font-tech text-sm px-4 py-2 rounded-full border transition-colors ${
              mode === k ? "bg-fg text-bg border-fg" : "border-line text-fg/70 hover:border-fg/40"
            }`}
          >
            {MODES[k].label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-5 items-center">
        <svg viewBox="0 0 500 290" className="w-full rounded-2xl bg-[#20443b]" role="img" aria-label={mode === "targets" ? "The boat circles a small lagoon of targets and never finishes" : "The boat races around the track to the finish line"}>
          <path d={TRACK} fill="none" stroke="#2b5146" strokeWidth="44" strokeLinejoin="round" />
          <path d={TRACK} fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="6 8" />
          {/* finish line */}
          <g transform="translate(46 140)">
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={i % 2 ? 14 : 0} y={i * 5} width="14" height="5" fill={i % 2 ? "var(--fg)" : "var(--bg)"} />
            ))}
          </g>
          <text x="22" y="132" fontSize="11" fontFamily="var(--font-space-grotesk)" fill="var(--fg)" opacity="0.6">finish</text>
          {/* lagoon + targets */}
          <ellipse cx="250" cy="175" rx="52" ry="38" fill="#9fc3e0" opacity="0.18" />
          {[[214, 175], [270, 152], [276, 196]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill="none" stroke="#e3a08a" strokeWidth="2" />
              <circle cx={x} cy={y} r="3" fill="#e3a08a" />
            </g>
          ))}
          <text x="250" y="230" textAnchor="middle" fontSize="11" fontFamily="var(--font-space-grotesk)" fill="var(--fg)" opacity="0.6">lagoon with targets</text>
          {/* the boat */}
          <g key={mode}>
            <circle r="9" fill="var(--fg)" stroke="var(--bg)" strokeWidth="2">
              <animateMotion dur={m.dur} repeatCount="indefinite" path={m.path} rotate="auto" />
            </circle>
          </g>
        </svg>

        <div aria-live="polite">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-line bg-bg p-3">
              <p className="font-tech text-[10px] uppercase tracking-[0.14em] text-fg/45 mb-1">Score</p>
              <p className="font-tech text-2xl font-bold text-fg tabular-nums">{mode === "targets" ? score : laps * 100}</p>
            </div>
            <div className="rounded-xl border border-line bg-bg p-3">
              <p className="font-tech text-[10px] uppercase tracking-[0.14em] text-fg/45 mb-1">Race finished?</p>
              <p className={`font-tech text-2xl font-bold ${m.finished ? (laps > 0 ? "text-sage" : "text-fg/50") : "text-[#e3a08a]"}`}>
                {m.finished ? (laps > 0 ? "Yes" : "…") : "Never"}
              </p>
            </div>
          </div>
          <p className="font-casual text-[15px] text-fg/75 leading-relaxed">{m.note}</p>
        </div>
      </div>
    </div>
  );
}
