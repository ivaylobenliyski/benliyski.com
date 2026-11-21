"use client";
import { useState } from "react";

/* The classic "bat and ball" question: the quick, intuitive answer is wrong;
   working it through gets it right. Written for this demo to show the effect
   reported in chain-of-thought research — not a live model. */

const QUESTION = "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?";

export default function StepByStep() {
  const [steps, setSteps] = useState(false);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-bg p-5 mb-4">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/45 mb-2">Prompt</p>
        <p className="font-mono text-[13px] leading-relaxed text-fg/85">
          {QUESTION}
          {steps && <span className="text-sage"> Let&apos;s think step by step.</span>}
        </p>
      </div>

      <label className="inline-flex items-center gap-3 mb-5 cursor-pointer select-none">
        <span className={`relative w-11 h-6 rounded-full transition-colors ${steps ? "bg-sage" : "bg-line"}`}>
          <input type="checkbox" className="sr-only" checked={steps} onChange={(e) => setSteps(e.target.checked)} />
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-fg transition-transform ${steps ? "translate-x-5" : ""}`} />
        </span>
        <span className="font-tech text-sm text-fg/80">Ask it to think step by step</span>
      </label>

      <div className={`rounded-2xl border p-5 ${steps ? "border-sage/60 bg-sage/10" : "border-[#e3a08a]/60 bg-[#e3a08a]/10"}`} aria-live="polite">
        <p className="font-tech text-[11px] uppercase tracking-[0.16em] text-fg/50 mb-2">Typical answer</p>
        {!steps ? (
          <>
            <p className="font-casual text-lg text-fg mb-2">The ball costs $0.10.</p>
            <p className="font-tech text-sm text-[#e3a08a]">✗ Wrong — then the bat would cost $1.10 and the total $1.20.</p>
          </>
        ) : (
          <>
            <ol className="font-casual text-[15px] text-fg/85 space-y-1 mb-3 list-decimal list-inside">
              <li>Call the ball&apos;s price x. The bat costs x + $1.00.</li>
              <li>Together: x + (x + $1.00) = $1.10.</li>
              <li>So 2x = $0.10, and x = $0.05.</li>
            </ol>
            <p className="font-casual text-lg text-fg mb-2">The ball costs $0.05.</p>
            <p className="font-tech text-sm text-sage">✓ Correct — $0.05 + $1.05 = $1.10.</p>
          </>
        )}
      </div>
    </div>
  );
}
