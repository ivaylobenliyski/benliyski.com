"use client";
import { useState, type ReactNode } from "react";

export type QuizItem = {
  id: string;
  emoji: string;
  thing: string;
  isAI: boolean;
  /** Short verdict shown after answering, e.g. "AI — machine learning". */
  verdict: string;
  why: ReactNode;
};

export default function IsItAI({ items }: { items: QuizItem[] }) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const answered = Object.keys(answers).length;
  const score = items.filter((i) => answers[i.id] === i.isAI).length;

  return (
    <div>
      <ul className="grid sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const guess = answers[item.id];
          const done = guess !== undefined;
          const right = guess === item.isAI;
          return (
            <li
              key={item.id}
              className={`rounded-2xl border p-5 transition-colors ${
                !done ? "border-line bg-bg" : right ? "border-sage/60 bg-bg" : "border-[#e3a08a]/60 bg-bg"
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl leading-none mt-0.5" aria-hidden="true">{item.emoji}</span>
                <p className="font-tech font-semibold text-fg leading-snug">{item.thing}</p>
              </div>
              {!done ? (
                <div className="flex gap-2" role="group" aria-label={`Is “${item.thing}” AI?`}>
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [item.id]: v }))}
                      className="flex-1 font-tech text-sm py-2.5 rounded-full border border-line text-fg/80 hover:border-fg/50 hover:text-fg transition-colors"
                    >
                      {v ? "AI" : "Not AI"}
                    </button>
                  ))}
                </div>
              ) : (
                <div aria-live="polite">
                  <p className={`font-tech text-sm font-semibold mb-1.5 ${right ? "text-sage" : "text-[#e3a08a]"}`}>
                    {right ? "✓ Right" : "✗ Not quite"} — {item.verdict}
                  </p>
                  <p className="font-casual text-[15px] text-fg/75 leading-relaxed">{item.why}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-4 font-tech text-sm text-fg/60">
        <span aria-live="polite">
          {answered === items.length ? `You got ${score} of ${items.length}.` : `${answered} of ${items.length} answered`}
        </span>
        {answered > 0 && (
          <button type="button" onClick={() => setAnswers({})} className="underline underline-offset-4 decoration-line hover:decoration-fg hover:text-fg">
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
