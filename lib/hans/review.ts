/**
 * Server-only helpers for the conversation viewer (/hans/team/chats) and its export:
 * loading stored chats with the service-role key, filtering, per-turn assembly and cost.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TurnLog, Usage } from "./agent";
import type { HansState } from "./state";

// List prices per 1M tokens (USD) for the default model, Nov 2026 – update if the model or prices change.
export const PRICE = { input: 4, output: 20, cache_read: 0.2, cache_write: 5 };
export const usd = (u: Partial<Usage> | null | undefined) =>
  ((u?.input ?? 0) * PRICE.input + (u?.output ?? 0) * PRICE.output + (u?.cache_read ?? 0) * PRICE.cache_read + (u?.cache_write ?? 0) * PRICE.cache_write) / 1e6;

export const PAGE_SIZE = 50;
const SCAN_LIMIT = 2000; // most recent chats scanned per list request (demo volume is far below this)

export type Line = { role: string; text: string };
export type LogEntry = Partial<TurnLog> & { error?: string };
export type Feedback = { chat_id: string; rating: "up" | "down"; comment: string | null; outcome: string | null; created_at: string };
export type ChatRow = {
  id: string; created_at: string; updated_at: string; outcome: string; turns: number;
  state: HansState; transcript: Line[]; usage: Usage; log: LogEntry[]; messages?: unknown[];
};

export type Filters = { outcome?: string; fb?: "down" | "up" | "any"; blocked?: boolean; toolfail?: boolean; handoff?: boolean; from?: string; to?: string; q?: string; page: number };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const fb = one(sp.fb);
  const from = one(sp.from), to = one(sp.to);
  return {
    outcome: one(sp.outcome),
    fb: fb === "down" || fb === "up" || fb === "any" ? fb : undefined,
    blocked: one(sp.blocked) === "1",
    toolfail: one(sp.toolfail) === "1",
    handoff: one(sp.handoff) === "1",
    from: from && DATE.test(from) ? from : undefined,
    to: to && DATE.test(to) ? to : undefined,
    q: one(sp.q)?.slice(0, 200),
    page: Math.max(1, Number(one(sp.page)) || 1),
  };
}

/** Query string for a filter set (used for links between pages and to the export). */
export function filterQuery(f: Filters, extra: Record<string, string | number> = {}): string {
  const p = new URLSearchParams();
  if (f.outcome) p.set("outcome", f.outcome);
  if (f.fb) p.set("fb", f.fb);
  if (f.blocked) p.set("blocked", "1");
  if (f.toolfail) p.set("toolfail", "1");
  if (f.handoff) p.set("handoff", "1");
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (f.q) p.set("q", f.q);
  for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

const logs = (c: ChatRow) => (Array.isArray(c.log) ? c.log : []);
export const blockCount = (c: ChatRow) => logs(c).reduce((n, l) => n + (l?.checks ?? []).filter((x) => x.problems?.length).length, 0);
export const toolFailCount = (c: ChatRow) => logs(c).reduce((n, l) => n + (l?.tool_calls ?? []).filter((x) => x.error).length + (l?.error ? 1 : 0), 0);
export const toolCallCount = (c: ChatRow) => logs(c).reduce((n, l) => n + (l?.tool_calls ?? []).length, 0);
export const handoffCount = (c: ChatRow) => c.state?.handoffs?.length ?? 0;

function matchesWords(c: ChatRow, q: string): boolean {
  const hay = [c.id, ...(c.transcript ?? []).map((l) => l.text), ...Object.values(c.state?.contact ?? {})].join("\n").toLocaleLowerCase("bg");
  return q.toLocaleLowerCase("bg").split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
}

// Sofia is UTC+2 / UTC+3; a ±1 day SQL window followed by an exact check on the Sofia date keeps this simple.
const sofiaDate = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Sofia" });
const shift = (d: string, days: number) => new Date(Date.parse(d) + days * 86400e3).toISOString().slice(0, 10);

export type Loaded = { chats: ChatRow[]; total: number; feedback: Map<string, Feedback[]>; capped: boolean };

/** Loads all chats matching the filters (newest first). `full` adds the model `messages` column (export). */
export async function loadChats(sb: SupabaseClient, f: Filters, full = false): Promise<Loaded> {
  const cols = `id,created_at,updated_at,outcome,turns,state,transcript,usage,log${full ? ",messages" : ""}`;
  let q = sb.from("hans_chats").select(cols).gt("turns", 0).order("created_at", { ascending: false }).limit(SCAN_LIMIT);
  if (f.outcome) q = q.eq("outcome", f.outcome);
  if (f.from) q = q.gte("created_at", shift(f.from, -1));
  if (f.to) q = q.lt("created_at", shift(f.to, 2));
  const [{ data, error }, { data: fbData }] = await Promise.all([
    q,
    sb.from("hans_feedback").select("chat_id,rating,comment,outcome,created_at").order("created_at", { ascending: true }).limit(10000),
  ]);
  if (error) throw new Error(error.message);
  const feedback = new Map<string, Feedback[]>();
  for (const r of (fbData ?? []) as Feedback[]) feedback.set(r.chat_id, [...(feedback.get(r.chat_id) ?? []), r]);
  const rows = (data ?? []) as unknown as ChatRow[];
  const chats = rows.filter((c) => {
    const d = sofiaDate(c.created_at);
    if (f.from && d < f.from) return false;
    if (f.to && d > f.to) return false;
    const fb = feedback.get(c.id) ?? [];
    if (f.fb === "any" && !fb.length) return false;
    if ((f.fb === "down" || f.fb === "up") && !fb.some((x) => x.rating === f.fb)) return false;
    if (f.blocked && !blockCount(c)) return false;
    if (f.toolfail && !toolFailCount(c)) return false;
    if (f.handoff && !handoffCount(c)) return false;
    if (f.q && !matchesWords(c, f.q)) return false;
    return true;
  });
  return { chats, total: chats.length, feedback, capped: rows.length >= SCAN_LIMIT };
}

export async function loadChat(sb: SupabaseClient, id: string) {
  const [{ data }, { data: fb }] = await Promise.all([
    sb.from("hans_chats").select("*").eq("id", id).maybeSingle(),
    sb.from("hans_feedback").select("chat_id,rating,comment,outcome,created_at").eq("chat_id", id).order("created_at"),
  ]);
  return data ? { chat: data as ChatRow, feedback: (fb ?? []) as Feedback[] } : null;
}

export type Turn = { n: number; user: string; reply: string; log: LogEntry | null };

/** Pairs customer messages with Hans's reply and that turn's log entry (log[i] belongs to customer message i). */
export function turns(c: ChatRow): { opening: string | null; turns: Turn[] } {
  const t = c.transcript ?? [];
  const opening = t[0]?.role === "assistant" ? t[0].text : null;
  const out: Turn[] = [];
  let n = 0;
  for (let i = opening === null ? 0 : 1; i < t.length; i++) {
    if (t[i].role !== "user") continue;
    const reply = t[i + 1]?.role === "assistant" ? t[i + 1].text : "";
    out.push({ n: n + 1, user: t[i].text, reply, log: logs(c)[n] ?? null });
    n++;
  }
  return { opening, turns: out };
}

/** RFC 4180 CSV, one row per customer turn. */
export function toCsv(chats: ChatRow[], feedback: Map<string, Feedback[]>): string {
  const head = ["chat_id", "created_at", "outcome", "turn", "customer", "hans", "tools", "tool_errors", "blocked_drafts", "checker_problems", "turn_error", "feedback", "feedback_comment", "chat_cost_usd"];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [head.join(",")];
  for (const c of chats) {
    const fb = feedback.get(c.id) ?? [];
    const rating = fb.map((x) => x.rating).join(" ");
    const comments = fb.map((x) => x.comment).filter(Boolean).join(" | ");
    for (const t of turns(c).turns) {
      const calls = t.log?.tool_calls ?? [];
      const blocked = (t.log?.checks ?? []).filter((x) => x.problems?.length);
      lines.push([
        c.id, c.created_at, c.outcome, t.n, t.user, t.reply,
        calls.map((x) => x.tool).join(" "), calls.filter((x) => x.error).length,
        blocked.map((x) => x.reply).join("\n---\n"), blocked.flatMap((x) => x.problems).join("; "),
        t.log?.error ?? "", rating, comments, usd(c.usage).toFixed(4),
      ].map(esc).join(","));
    }
  }
  return lines.join("\r\n") + "\r\n";
}
