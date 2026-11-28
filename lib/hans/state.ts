import type { Quote } from "./pricing";

export type Appointment = { kind: "call" | "consultation"; slot: string; name: string; phone: string; address: string };
export type SentEmail = { to: string; at: string; subject: string; body: string };
export type Ticket = { id: string; reason: string; summary: string; at: string };

/** Everything Hans has done in one conversation (stored as JSON in hans_chats.state). */
export type HansState = {
  today: string; // Europe/Sofia date when the chat started
  userTurns: number;
  lastUserText: string;
  quotes: Quote[];
  lastItems: unknown[];
  pendingEmail: { to: string; name: string; body: string; quoteIndex: number } | null;
  previewTurn: number;
  emailsSent: SentEmail[];
  appointments: Appointment[];
  handoffs: Ticket[];
  contact: Record<string, string>;
};

export const newState = (today: string): HansState => ({
  today, userTurns: 0, lastUserText: "", quotes: [], lastItems: [], pendingEmail: null, previewTurn: -1,
  emailsSent: [], appointments: [], handoffs: [], contact: {},
});

export function outcome(s: HansState): string {
  if (s.handoffs.length) return "handoff";
  if (s.appointments.length) return "appointment";
  if (s.emailsSent.length) return "offer_emailed";
  if (s.quotes.length) return "quoted";
  return "open";
}
