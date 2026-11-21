"use client";
import { useState } from "react";

/* Quiz: sort everyday AI uses into the EU AI Act's risk levels. */

type Tier = "banned" | "high" | "transparency" | "minimal";

const TIERS: Record<Tier, { label: string; rule: string; cls: string }> = {
  banned: { label: "Banned", rule: "Not allowed in the EU at all.", cls: "bg-[#e3a08a]/25 border-[#e3a08a]/70" },
  high: { label: "High risk", rule: "Allowed, with strict checks: risk management, quality data, human oversight.", cls: "bg-[#d9b98a]/20 border-[#d9b98a]/70" },
  transparency: { label: "Must disclose", rule: "Allowed, but people must be told they're dealing with AI or AI-made content.", cls: "bg-[#9fc3e0]/20 border-[#9fc3e0]/70" },
  minimal: { label: "Minimal risk", rule: "No extra obligations.", cls: "bg-sage/20 border-sage/70" },
};
const ORDER: Tier[] = ["banned", "high", "transparency", "minimal"];

const ITEMS: { id: string; icon: string; text: string; tier: Tier }[] = [
  { id: "social", icon: "🏛️", text: "Scoring citizens' social behaviour to decide who gets public services", tier: "banned" },
  { id: "cv", icon: "📄", text: "Ranking job applicants' CVs", tier: "high" },
  { id: "chatbot", icon: "💬", text: "A customer-service chatbot", tier: "transparency" },
  { id: "spam", icon: "📧", text: "An email spam filter", tier: "minimal" },
  { id: "deepfake", icon: "🎭", text: "A realistic AI-generated video of a real person", tier: "transparency" },
  { id: "medical", icon: "🩺", text: "AI that helps diagnose disease in medical scans", tier: "high" },
];

export default function RiskLadder() {
  const [guesses, setGuesses] = useState<Record<string, Tier>>({});
  const done = Object.keys(guesses).length;
  const right = ITEMS.filter((i) => guesses[i.id] === i.tier).length;

  return (
    <div>
      <div className="grid sm:grid-cols-4 gap-2 mb-6">
        {ORDER.map((t, i) => (
          <div key={t} className={`rounded-xl border px-3 py-2.5 ${TIERS[t].cls}`} style={{ marginLeft: 0 }}>
            <p className="font-tech text-sm font-semibold text-fg">
              <span className="text-fg/50 mr-1.5" aria-hidden="true">{"▲".repeat(4 - i)}</span>
              {TIERS[t].label}
            </p>
            <p className="font-casual text-xs text-fg/65 leading-snug mt-1">{TIERS[t].rule}</p>
          </div>
        ))}
      </div>

      <ul className="space-y-3">
        {ITEMS.map((it) => {
          const g = guesses[it.id];
          return (
            <li key={it.id} className="rounded-2xl border border-line bg-bg p-4">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-xl leading-none mt-0.5" aria-hidden="true">{it.icon}</span>
                <p className="font-tech font-semibold text-fg leading-snug">{it.text}</p>
              </div>
              {!g ? (
                <div role="group" aria-label={`Risk level for: ${it.text}`} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ORDER.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setGuesses((s) => ({ ...s, [it.id]: t }))}
                      className="font-tech text-xs sm:text-sm py-2 rounded-full border border-line text-fg/75 hover:border-fg/50 hover:text-fg transition-colors"
                    >
                      {TIERS[t].label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="font-casual text-[15px] text-fg/80" aria-live="polite">
                  <span className={`font-tech font-semibold mr-2 ${g === it.tier ? "text-sage" : "text-[#e3a08a]"}`}>
                    {g === it.tier ? "✓ Right:" : `✗ You said ${TIERS[g].label}. It's:`}
                  </span>
                  <span className={`inline-block font-tech text-sm px-2.5 py-0.5 rounded-full border mr-2 ${TIERS[it.tier].cls}`}>{TIERS[it.tier].label}</span>
                  {TIERS[it.tier].rule}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between font-tech text-sm text-fg/60">
        <span aria-live="polite">{done === ITEMS.length ? `You got ${right} of ${ITEMS.length}.` : `${done} of ${ITEMS.length} sorted`}</span>
        {done > 0 && (
          <button type="button" onClick={() => setGuesses({})} className="underline underline-offset-4 decoration-line hover:decoration-fg hover:text-fg">
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
