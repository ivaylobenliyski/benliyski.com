"use client";
import { useState } from "react";

/* An illustrative "shared embedding space": pictures and sentences that mean the same
   thing are placed close together. Positions are hand-made for teaching. */

type Item = { id: string; kind: "image" | "text"; label: string; x: number; y: number };

const ITEMS: Item[] = [
  { id: "dog-img", kind: "image", label: "🐕", x: 14, y: 12 },
  { id: "dog-txt", kind: "text", label: "a dog catching a ball", x: 22, y: 27 },
  { id: "cat-img", kind: "image", label: "🐈", x: 52, y: 33 },
  { id: "cat-txt", kind: "text", label: "a sleepy cat", x: 42, y: 47 },
  { id: "sun-img", kind: "image", label: "🌅", x: 84, y: 12 },
  { id: "sun-txt", kind: "text", label: "sunset over the sea", x: 76, y: 27 },
  { id: "soup-img", kind: "image", label: "🍲", x: 14, y: 66 },
  { id: "soup-txt", kind: "text", label: "a bowl of hot soup", x: 24, y: 81 },
  { id: "car-img", kind: "image", label: "🏎️", x: 84, y: 66 },
  { id: "car-txt", kind: "text", label: "a red racing car", x: 74, y: 81 },
];

const dist = (a: Item, b: Item) => Math.hypot(a.x - b.x, a.y - b.y);

export default function MeaningSpace() {
  const [sel, setSel] = useState("dog-txt");
  const s = ITEMS.find((i) => i.id === sel)!;
  const ranked = ITEMS.filter((i) => i.id !== sel)
    .map((i) => ({ i, d: dist(s, i) }))
    .sort((a, b) => a.d - b.d);
  const nearest = ranked.slice(0, 1);
  const furthest = ranked[ranked.length - 1];
  const maxD = 100;
  const sim = (d: number) => Math.max(0, 1 - d / maxD);

  return (
    <div className="grid md:grid-cols-[1.3fr_1fr] gap-6">
      <div className="relative aspect-square md:aspect-[4/3.3] rounded-2xl border border-line bg-bg overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {nearest.map(({ i }) => (
            <line key={i.id} x1={s.x} y1={s.y} x2={i.x} y2={i.y} stroke="var(--sage)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
          ))}
        </svg>
        {ITEMS.map((it) => {
          const on = it.id === sel;
          const near = nearest.some((n) => n.i.id === it.id);
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => setSel(it.id)}
              aria-pressed={on}
              aria-label={it.kind === "image" ? `Picture: ${it.id.split("-")[0]}` : `Text: ${it.label}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${
                it.kind === "image"
                  ? `w-11 h-11 rounded-xl flex items-center justify-center text-2xl border ${on ? "border-fg bg-card scale-110" : near ? "border-sage bg-card" : "border-line bg-card"}`
                  : `max-w-[40%] sm:max-w-[34%] text-center font-casual text-[12px] sm:text-[13px] leading-tight px-2 py-1 rounded-lg border ${
                      on ? "bg-fg text-bg border-fg" : near ? "border-sage text-fg bg-bg" : "border-line text-fg/70 bg-bg"
                    }`
              }`}
              style={{ left: `${it.x}%`, top: `${it.y}%` }}
            >
              {it.kind === "image" ? it.label : `“${it.label}”`}
            </button>
          );
        })}
        <span className="absolute bottom-2 right-3 font-tech text-[10px] text-fg/35">illustrative 2-D map</span>
      </div>

      <div aria-live="polite">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-2">You picked</p>
        <p className="font-tech text-lg font-semibold text-fg mb-5">
          {s.kind === "image" ? `A picture ${s.label}` : `The text “${s.label}”`}
        </p>
        <ul className="space-y-2 mb-5">
          {[
            { tag: "Closest in meaning", tone: "text-sage", border: "border-sage/60", ...nearest[0] },
            { tag: "Furthest away", tone: "text-fg/45", border: "border-line", ...furthest },
          ].map(({ tag, tone, border, i, d }) => (
            <li key={tag}>
              <p className={`font-tech text-[11px] uppercase tracking-[0.16em] mb-1.5 ${tone}`}>{tag}</p>
              <div className={`flex items-center justify-between gap-3 rounded-xl border ${border} px-3 py-2`}>
                <span className="font-casual text-[15px] text-fg">{i.kind === "image" ? `picture ${i.label}` : `“${i.label}”`}</span>
                <span className="font-tech text-sm text-fg/60 tabular-nums">similarity {sim(d).toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="font-casual text-sm text-fg/60 leading-relaxed">
          Click any picture or phrase. Matching pictures and words sit next to each other — that&apos;s what lets you search photos by
          typing, or ask a model about an image.
        </p>
      </div>
    </div>
  );
}
