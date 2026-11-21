"use client";
import { useMemo, useState } from "react";

/* Illustrative next-word prediction with a temperature dial.
   The scores are hand-made for teaching, not taken from a real model. */

type Prompt = { text: string; options: { w: string; score: number }[] };

const PROMPTS: Prompt[] = [
  {
    text: "The capital of France is",
    options: [
      { w: "Paris", score: 9 },
      { w: "a", score: 5.2 },
      { w: "the", score: 4.6 },
      { w: "located", score: 3.4 },
      { w: "Lyon", score: 2 },
    ],
  },
  {
    text: "My favourite thing to eat for breakfast is",
    options: [
      { w: "eggs", score: 4.2 },
      { w: "toast", score: 4 },
      { w: "porridge", score: 3.6 },
      { w: "pancakes", score: 3.5 },
      { w: "cold pizza", score: 2.6 },
    ],
  },
  {
    text: "Once upon a time, there was a",
    options: [
      { w: "little", score: 5 },
      { w: "young", score: 4.4 },
      { w: "king", score: 4.1 },
      { w: "dragon", score: 3.5 },
      { w: "toaster", score: 1.2 },
    ],
  },
];

function softmax(scores: number[], t: number) {
  const scaled = scores.map((s) => s / t);
  const m = Math.max(...scaled);
  const e = scaled.map((s) => Math.exp(s - m));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((x) => x / sum);
}

function sample(probs: number[]) {
  let r = Math.random();
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i];
    if (r <= 0) return i;
  }
  return probs.length - 1;
}

export default function NextWord() {
  const [pi, setPi] = useState(0);
  const [temp, setTemp] = useState(1);
  const [picks, setPicks] = useState<number[]>([]);
  const prompt = PROMPTS[pi];
  const probs = useMemo(() => softmax(prompt.options.map((o) => o.score), temp), [prompt, temp]);
  const last = picks[picks.length - 1];

  const choose = (n: number) => setPicks(Array.from({ length: n }, () => sample(probs)));
  const counts = prompt.options.map((_, i) => picks.filter((p) => p === i).length);

  return (
    <div>
      <div role="group" aria-label="Choose a prompt" className="flex flex-wrap gap-2 mb-5">
        {PROMPTS.map((p, i) => (
          <button
            key={p.text}
            type="button"
            aria-pressed={pi === i}
            onClick={() => {
              setPi(i);
              setPicks([]);
            }}
            className={`font-tech text-sm px-3.5 py-1.5 rounded-full border transition-colors text-left ${
              pi === i ? "bg-fg text-bg border-fg" : "border-line text-fg/70 hover:border-fg/40"
            }`}
          >
            “{p.text.split(" ").slice(0, 4).join(" ")}…”
          </button>
        ))}
      </div>

      <p className="font-casual text-xl md:text-2xl text-fg leading-snug mb-6" aria-live="polite">
        {prompt.text}{" "}
        {last !== undefined ? (
          <span className="bg-sage/25 text-fg rounded-md px-1.5">{prompt.options[last].w}</span>
        ) : (
          <span className="inline-block w-14 border-b-2 border-dashed border-sage align-baseline" aria-label="blank" />
        )}
      </p>

      <ul className="space-y-2 mb-6">
        {prompt.options.map((o, i) => (
          <li key={o.w} className="grid grid-cols-[96px_1fr_52px] sm:grid-cols-[120px_1fr_60px] items-center gap-3">
            <span className="font-tech text-sm text-fg truncate">{o.w}</span>
            <span className="h-3 rounded-full bg-line overflow-hidden">
              <span className="block h-full rounded-full bg-sage transition-[width] duration-300" style={{ width: `${Math.max(1, probs[i] * 100)}%` }} />
            </span>
            <span className="font-tech text-sm text-fg/60 tabular-nums text-right">
              {picks.length > 1 ? `${counts[i]}×` : `${(probs[i] * 100).toFixed(probs[i] < 0.01 ? 1 : 0)}%`}
            </span>
          </li>
        ))}
      </ul>

      <label className="block mb-5">
        <span className="flex justify-between font-tech text-sm text-fg/70 mb-1.5">
          <span>Temperature (“creativity”)</span>
          <span className="tabular-nums text-fg">{temp.toFixed(1)}</span>
        </span>
        <input
          type="range"
          min={0.2}
          max={2.5}
          step={0.1}
          value={temp}
          onChange={(e) => {
            setTemp(Number(e.target.value));
            setPicks([]);
          }}
          className="w-full accent-[var(--sage)] h-6"
        />
        <span className="flex justify-between font-tech text-xs text-fg/45 mt-1">
          <span>predictable</span>
          <span>surprising</span>
        </span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => choose(1)} className="font-tech text-sm font-semibold bg-fg text-bg px-5 py-2.5 rounded-full hover:bg-white transition-colors">
          Pick the next word
        </button>
        <button type="button" onClick={() => choose(20)} className="font-tech text-sm px-4 py-2.5 rounded-full border border-line text-fg/80 hover:border-fg/50">
          Pick 20 times
        </button>
      </div>
      {picks.length > 1 && (
        <p className="mt-3 font-casual text-sm text-fg/60">Counts show how often each word was picked in 20 tries. Raise the temperature and rarer words start appearing.</p>
      )}
    </div>
  );
}
