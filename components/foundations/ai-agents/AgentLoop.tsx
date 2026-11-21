"use client";
import { useState } from "react";

/* A scripted walk-through of an agent loop (think → act → observe), including a
   tool failure and a human-approval step. Illustrative, not a live agent. */

type Kind = "goal" | "think" | "act" | "observe" | "ask" | "done";
type Step = { kind: Kind; text: string };

const STEPS: Step[] = [
  { kind: "goal", text: "Find a free hour with Maria next week and send her an invite." },
  { kind: "think", text: "First I need to know when the user is free next week." },
  { kind: "act", text: "check_calendar(person: \"me\", week: \"next\")" },
  { kind: "observe", text: "Free: Tue 10:00–12:00 · Wed 14:00–15:00 · Thu 09:00–11:00" },
  { kind: "think", text: "Now I need Maria's free times so I can find an overlap." },
  { kind: "act", text: "check_calendar(person: \"Maria\", week: \"next\")" },
  { kind: "observe", text: "Error: no permission to view Maria's calendar." },
  { kind: "think", text: "I can't see her calendar. Plan B: offer the user's free slots and let Maria pick." },
  { kind: "act", text: "draft_email(to: \"Maria\", options: [Tue 10:00, Wed 14:00, Thu 09:00])" },
  { kind: "observe", text: "Draft ready: “Hi Maria — could you do one of these next week? …”" },
  { kind: "think", text: "Sending an email on someone's behalf is a real-world action. I should check first." },
  { kind: "ask", text: "“I've drafted an email to Maria offering three times. Send it?” — User: “Yes.”" },
  { kind: "act", text: "send_email(draft)" },
  { kind: "observe", text: "Sent." },
  { kind: "done", text: "Done: I couldn't access Maria's calendar, so I emailed her three of your free slots. I'll let you know when she replies." },
];

const STYLE: Record<Kind, { label: string; cls: string }> = {
  goal: { label: "Goal", cls: "border-fg/40 bg-card text-fg" },
  think: { label: "Think", cls: "border-sage/60 bg-sage/10 text-fg" },
  act: { label: "Act · tool call", cls: "border-[#d9b98a]/60 bg-[#d9b98a]/10 text-fg font-mono text-[13px]" },
  observe: { label: "Observe", cls: "border-[#9fc3e0]/60 bg-[#9fc3e0]/10 text-fg" },
  ask: { label: "Ask the human", cls: "border-[#e3a08a]/60 bg-[#e3a08a]/10 text-fg" },
  done: { label: "Done", cls: "border-fg bg-fg text-bg" },
};

const NOTES: Partial<Record<number, string>> = {
  2: "The model doesn't touch your calendar itself. It writes a structured request; the app runs the tool and sends back the result.",
  6: "Tools fail. A good agent notices the error and changes plan instead of carrying on blindly.",
  11: "For actions that are hard to undo — sending, paying, deleting — well-designed agents pause for a human.",
};

export default function AgentLoop() {
  const [shown, setShown] = useState(1);
  const finished = shown >= STEPS.length;
  const lastNote = [...Array(shown).keys()].reverse().find((i) => NOTES[i]);

  return (
    <div>
      <ol className="space-y-2 mb-5" aria-live="polite">
        {STEPS.slice(0, shown).map((s, i) => (
          <li key={i} className={`rounded-xl border px-4 py-3 ${STYLE[s.kind].cls} ${i === shown - 1 ? "ring-1 ring-fg/30" : ""}`}>
            <span className={`block font-tech text-[10px] uppercase tracking-[0.16em] mb-1 ${s.kind === "done" ? "text-bg/60" : "text-fg/50"}`}>
              {STYLE[s.kind].label}
            </span>
            <span className={`block leading-relaxed ${s.kind === "act" ? "" : "font-casual text-[15px]"}`}>{s.text}</span>
          </li>
        ))}
      </ol>

      {lastNote !== undefined && (
        <p className="mb-5 font-casual text-sm text-fg/65 leading-relaxed border-l-2 border-sage pl-3">{NOTES[lastNote]}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!finished ? (
          <>
            <button type="button" onClick={() => setShown((n) => n + 1)} className="font-tech text-sm font-semibold bg-fg text-bg px-5 py-2.5 rounded-full hover:bg-white transition-colors">
              Next step
            </button>
            <button type="button" onClick={() => setShown(STEPS.length)} className="font-tech text-sm px-4 py-2.5 rounded-full border border-line text-fg/80 hover:border-fg/50">
              Show all
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setShown(1)} className="font-tech text-sm font-semibold bg-fg text-bg px-5 py-2.5 rounded-full hover:bg-white transition-colors">
            Restart
          </button>
        )}
        <span className="font-tech text-xs text-fg/45 ml-1 tabular-nums">
          step {shown} of {STEPS.length}
        </span>
      </div>
    </div>
  );
}
