"use client";
import { useState } from "react";

/* Toggle prompt "ingredients" and see how the prompt and a typical answer change.
   The answers are written for this demo to show the pattern — not real model output. */

type Key = "role" | "audience" | "format" | "length" | "example";

const INGREDIENTS: Record<Key, { label: string; text: string }> = {
  role: { label: "Give it a role", text: "You are a copywriter for an outdoor-gear brand." },
  audience: { label: "Add context", text: "It's for hikers who care about weight and keeping water cold on long summer trails." },
  format: { label: "Set the format", text: "Use a one-line headline followed by three bullet points." },
  length: { label: "Set limits", text: "Keep it under 40 words." },
  example: { label: "Show an example", text: "Match the tone of this line from our site: “Light pack. Long trail. No excuses.”" },
};
const ORDER: Key[] = ["role", "audience", "format", "length", "example"];
const TASK = "Write a product description for our reusable water bottle.";

function answer(on: Record<Key, boolean>) {
  const hiker = on.audience;
  const points = hiker
    ? ["Keeps water cold for 24 hours, even in summer heat", "Weighs under 300 g, so it won't slow you down", "Leak-proof lid that clips onto your pack", "Fits standard bottle pockets"]
    : ["It is durable and eco-friendly", "It keeps drinks cold", "It is easy to clean", "It comes in several colours"];
  const headline = on.example
    ? hiker
      ? "Cold water. Light pack. Long trail."
      : "Refill. Repeat. Go."
    : on.role
      ? hiker
        ? "Hydration built for the long haul."
        : "Your new everyday favourite."
      : null;
  const n = on.length ? 3 : 4;
  const list = points.slice(0, n);

  if (on.format) return { headline: headline ?? "Reusable water bottle", bullets: list, para: null as string | null };
  const sentences = list.map((p) => (p.endsWith(".") ? p : p + "."));
  const closing = on.length ? "" : hiker ? " Ready for your next summit." : " Order yours today and stay hydrated wherever you go.";
  const opener = hiker ? "" : "This reusable water bottle is a great choice for everyday use. ";
  return { headline, bullets: null as string[] | null, para: opener + sentences.join(" ") + closing };
}

export default function PromptBuilder() {
  const [on, setOn] = useState<Record<Key, boolean>>({ role: false, audience: false, format: false, length: false, example: false });
  const count = ORDER.filter((k) => on[k]).length;
  const out = answer(on);

  return (
    <div>
      <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-2">Add ingredients</p>
      <div role="group" aria-label="Prompt ingredients" className="flex flex-wrap gap-2 mb-6">
        {ORDER.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={on[k]}
            onClick={() => setOn((s) => ({ ...s, [k]: !s[k] }))}
            className={`font-tech text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
              on[k] ? "bg-fg text-bg border-fg" : "border-line text-fg/70 hover:border-fg/40"
            }`}
          >
            {on[k] ? "✓ " : "+ "}
            {INGREDIENTS[k].label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-line bg-bg p-5">
          <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-3">Your prompt</p>
          <div className="font-mono text-[13px] leading-relaxed text-fg/85 space-y-1.5">
            {ORDER.filter((k) => k === "role" && on[k]).map((k) => (
              <p key={k} className="text-sage">{INGREDIENTS[k].text}</p>
            ))}
            <p>{TASK}</p>
            {ORDER.filter((k) => k !== "role" && on[k]).map((k) => (
              <p key={k} className="text-sage">{INGREDIENTS[k].text}</p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-sage/50 bg-bg p-5" aria-live="polite">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-sage">Typical answer</p>
            <span className="font-tech text-[11px] text-fg/45">{count}/5 ingredients</span>
          </div>
          {out.headline && <p className="font-tech font-semibold text-fg mb-2">{out.headline}</p>}
          {out.bullets ? (
            <ul className="space-y-1">
              {out.bullets.map((b) => (
                <li key={b} className="flex gap-2 font-casual text-[15px] text-fg/85">
                  <span className="text-sage" aria-hidden="true">•</span>
                  {b}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-casual text-[15px] text-fg/85 leading-relaxed">{out.para}</p>
          )}
        </div>
      </div>
      <p className="mt-3 font-casual text-sm text-fg/55">
        {count === 0
          ? "A vague prompt gets a generic answer. Add ingredients one at a time and watch it sharpen."
          : count < 5
            ? "Each ingredient removes a guess the model would otherwise have to make."
            : "Same model, same task — a far more useful answer, because nothing was left to guesswork."}
      </p>
    </div>
  );
}
