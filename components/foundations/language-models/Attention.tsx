"use client";
import { useState } from "react";

/* Illustrative attention: what "it" focuses on depends on the last word.
   Weights are hand-made for teaching, in the spirit of Google's 2017 transformer explainer. */

const WORDS = ["The", "dog", "didn't", "cross", "the", "road", "because", "it", "was", "too"];
const IT = 7;

const ENDINGS = {
  tired: { label: "tired", refers: 1, note: "Dogs get tired, roads don't — so “it” attends mostly to “dog”." },
  busy: { label: "busy", refers: 5, note: "Roads get busy — so now “it” attends mostly to “road”." },
} as const;
type Ending = keyof typeof ENDINGS;

function weightsFor(focus: number, ending: Ending): number[] {
  const all = [...WORDS, ENDINGS[ending].label];
  if (focus === IT) {
    const target = ENDINGS[ending].refers;
    const other = target === 1 ? 5 : 1;
    return all.map((_, i) => (i === target ? 1 : i === other ? 0.22 : i === all.length - 1 ? 0.45 : i === IT ? 0.15 : 0.06));
  }
  // Other words: mostly themselves and their neighbours.
  return all.map((_, i) => (i === focus ? 0.7 : Math.abs(i - focus) === 1 ? 0.35 : 0.05));
}

export default function Attention() {
  const [ending, setEnding] = useState<Ending>("tired");
  const [focus, setFocus] = useState(IT);
  const all = [...WORDS, ENDINGS[ending].label];
  const w = weightsFor(focus, ending);

  return (
    <div>
      <div role="group" aria-label="Choose how the sentence ends" className="flex items-center gap-2 mb-6 font-tech text-sm text-fg/60">
        <span>Sentence ends with:</span>
        {(Object.keys(ENDINGS) as Ending[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={ending === k}
            onClick={() => {
              setEnding(k);
              setFocus(IT);
            }}
            className={`px-3.5 py-1.5 rounded-full border transition-colors ${ending === k ? "bg-fg text-bg border-fg" : "border-line text-fg/70 hover:border-fg/40"}`}
          >
            “{k}”
          </button>
        ))}
      </div>

      <p className="flex flex-wrap gap-x-1.5 gap-y-3 font-casual text-xl md:text-2xl leading-none mb-6">
        {all.map((word, i) => {
          const on = i === focus;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setFocus(i)}
              aria-pressed={on}
              aria-label={`${word}: attention ${Math.round(w[i] * 100)}%`}
              className={`relative rounded-md px-1.5 py-1.5 transition-colors ${on ? "ring-2 ring-fg text-fg" : "text-fg"}`}
              style={{ backgroundColor: on ? "transparent" : `rgba(157, 191, 168, ${w[i] * 0.6})` }}
            >
              {word}
              {i === all.length - 1 && "."}
            </button>
          );
        })}
      </p>

      <p className="font-casual text-[15px] text-fg/70 leading-relaxed" aria-live="polite">
        {focus === IT ? (
          ENDINGS[ending].note
        ) : (
          <>
            You&apos;re looking at <strong className="text-fg">“{all[focus]}”</strong>. Most words mainly attend to themselves and their
            neighbours. Click <strong className="text-fg">“it”</strong> to see the interesting case.
          </>
        )}
      </p>
    </div>
  );
}
