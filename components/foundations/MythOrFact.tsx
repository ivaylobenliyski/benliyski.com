"use client";
import { useState, type ReactNode } from "react";

export type MythOrFactItem = {
  statement: string;
  isMyth: boolean;
  /** Shown after answering — the correction (for a myth) or the evidence (for a fact), with citations. */
  explanation: ReactNode;
};

function Dots({ items, answers, index }: { items: MythOrFactItem[]; answers: (boolean | null)[]; index: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {items.map((it, i) => {
        const a = answers[i];
        const state = a === null ? (i === index ? "now" : "todo") : a === it.isMyth ? "right" : "wrong";
        return (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              state === "now" ? "w-6 bg-fg" : state === "right" ? "w-3 bg-sage" : state === "wrong" ? "w-3 bg-[#e3a08a]" : "w-3 bg-line"
            }`}
          />
        );
      })}
    </div>
  );
}

/** One-statement-at-a-time "Myth or fact?" game used at the end of every Foundations guide. */
export default function MythOrFact({ items }: { items: MythOrFactItem[] }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => items.map(() => null));
  const done = index >= items.length;
  const score = answers.filter((a, i) => a !== null && a === items[i].isMyth).length;

  const answer = (saysMyth: boolean) => setAnswers((prev) => prev.map((a, i) => (i === index ? saysMyth : a)));
  const restart = () => {
    setAnswers(items.map(() => null));
    setIndex(0);
  };


  if (done) {
    const msg =
      score === items.length
        ? "Perfect score — you can spot AI hype a mile off."
        : score >= items.length - 2
          ? "Nicely done. A couple of these trip up most people."
          : "Tricky, right? That's exactly why these myths spread.";
    return (
      <div className="rounded-3xl border border-sage/50 bg-card p-6 sm:p-8">
        <Dots items={items} answers={answers} index={index} />
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage mt-6 mb-2">Your score</p>
        <p className="font-tech text-5xl font-bold text-fg mb-2 tabular-nums" aria-live="polite">
          {score}/{items.length}
        </p>
        <p className="font-casual text-lg text-fg/75 mb-6">{msg}</p>
        <button type="button" onClick={restart} className="font-tech text-sm font-semibold bg-fg text-bg px-5 py-2.5 rounded-full hover:bg-white transition-colors">
          Play again
        </button>

        <details className="group mt-8 border-t border-line pt-5">
          <summary className="cursor-pointer list-none flex justify-between font-tech text-sm text-fg/75">
            See all answers <span className="text-fg/40 group-open:rotate-45 transition-transform">+</span>
          </summary>
          <ol className="mt-5 space-y-4">
            {items.map((it, i) => (
              <li key={i} className="border-l-2 pl-4" style={{ borderColor: it.isMyth ? "#e3a08a" : "var(--sage)" }}>
                <p className={`font-tech text-[11px] uppercase tracking-[0.16em] mb-1 ${it.isMyth ? "text-[#e3a08a]" : "text-sage"}`}>
                  {it.isMyth ? "Myth" : "Fact"}
                </p>
                <p className="font-tech font-semibold text-fg mb-1">{it.statement}</p>
                <p className="font-casual text-[15px] text-fg/70 leading-relaxed">{it.explanation}</p>
              </li>
            ))}
          </ol>
        </details>
      </div>
    );
  }

  const item = items[index];
  const given = answers[index];
  const answered = given !== null;
  const right = given === item.isMyth;

  return (
    <div className="rounded-3xl border border-line bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Dots items={items} answers={answers} index={index} />
        <span className="font-tech text-xs text-fg/45 tabular-nums">
          {index + 1} of {items.length} · score {score}
        </span>
      </div>

      <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-3">Myth or fact?</p>
      <p className="font-casual text-xl sm:text-2xl text-fg leading-snug mb-7 min-h-[3.5rem]">“{item.statement}”</p>

      {!answered ? (
        <div key={`answer-${index}`} className="grid grid-cols-2 gap-3" role="group" aria-label="Your answer">
          <button
            type="button"
            onClick={() => answer(true)}
            className="font-tech font-semibold py-3.5 rounded-2xl border-2 border-[#e3a08a]/60 text-fg hover:bg-[#e3a08a]/15 transition-colors"
          >
            Myth
          </button>
          <button
            type="button"
            onClick={() => answer(false)}
            className="font-tech font-semibold py-3.5 rounded-2xl border-2 border-sage/70 text-fg hover:bg-sage/15 transition-colors"
          >
            Fact
          </button>
        </div>
      ) : (
        <div key={`result-${index}`} aria-live="polite">
          <div className={`rounded-2xl border p-5 mb-5 ${right ? "border-sage/60 bg-sage/10" : "border-[#e3a08a]/60 bg-[#e3a08a]/10"}`}>
            <p className={`font-tech font-semibold mb-2 ${right ? "text-sage" : "text-[#e3a08a]"}`}>
              {right ? "✓ Correct" : "✗ Not quite"} — it&apos;s a {item.isMyth ? "myth" : "fact"}.
            </p>
            <p className="font-casual text-[16px] text-fg/85 leading-relaxed">{item.explanation}</p>
          </div>
          <button
            key="next"
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="font-tech text-sm font-semibold bg-fg text-bg px-5 py-2.5 rounded-full hover:bg-white transition-colors"
          >
            {index === items.length - 1 ? "See your score →" : "Next statement →"}
          </button>
        </div>
      )}
    </div>
  );
}
