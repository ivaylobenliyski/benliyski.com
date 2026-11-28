/** Shared logic for the /api/hans/* route handlers. */
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { emptyUsage, hansTurn, type Usage } from "./agent";
import { authorized } from "./auth";
import { bookSlot, db, takenSlots } from "./db";
import { OPENING, WIDGET_NOTICE } from "./generated";
import { sofiaToday } from "./slots";
import { newState, outcome, type HansState } from "./state";

const MAX_MSG_CHARS = 1000;
const MAX_TURNS = 40;
const DAILY_CHATS = Number(process.env.HANS_DAILY_CHATS || 100);
const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: HEADERS });

type Row = { id: string; turns: number; messages: Anthropic.Beta.BetaMessageParam[]; state: HansState; transcript: { role: string; text: string }[]; usage: Usage; log: unknown[] };

export function publicState(s: HansState) {
  return {
    quote: s.quotes.at(-1) ?? null,
    emails_sent: s.emailsSent.map((e) => ({ to: e.to, at: e.at })),
    appointments: s.appointments.map(({ kind, slot }) => ({ kind, slot })),
    handoff: s.handoffs.length > 0,
    outcome: outcome(s),
  };
}

function guard(req: Request) {
  if (!authorized(req.headers.get("authorization"))) return { error: json({ error: "unauthorized" }, 401) };
  const sb = db();
  if (!sb) return { error: json({ error: "storage not configured (SUPABASE_SERVICE_ROLE_KEY)" }, 503) };
  return { sb };
}

async function body(req: Request): Promise<Record<string, unknown>> {
  try {
    const text = await req.text();
    return text.length > 20_000 ? {} : JSON.parse(text || "{}");
  } catch {
    return {};
  }
}

export async function start(req: Request) {
  const g = guard(req);
  if (g.error) return g.error;
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await g.sb.from("hans_chats").select("id", { count: "exact", head: true }).gte("created_at", since);
  if ((count ?? 0) >= DAILY_CHATS) return json({ error: "Демото достигна дневния лимит. Опитайте утре." }, 429);
  const id = randomBytes(6).toString("hex");
  const state = newState(sofiaToday());
  const { error } = await g.sb.from("hans_chats").insert({ id, state, transcript: [{ role: "assistant", text: OPENING }], usage: emptyUsage() });
  if (error) return json({ error: "could not start chat" }, 500);
  return json({ chat_id: id, reply: OPENING, notice: WIDGET_NOTICE, state: publicState(state) });
}

export async function message(req: Request) {
  const g = guard(req);
  if (g.error) return g.error;
  const b = await body(req);
  const text = String(b.text ?? "").trim();
  if (!text) return json({ error: "empty message" }, 400);
  if (text.length > MAX_MSG_CHARS) return json({ error: `message too long (max ${MAX_MSG_CHARS} characters)` }, 400);
  const { data } = await g.sb.from("hans_chats").select("*").eq("id", String(b.chat_id ?? "")).maybeSingle();
  const row = data as Row | null;
  if (!row) return json({ error: "unknown chat; start a new one" }, 404);
  if (row.turns >= MAX_TURNS) return json({ error: "Разговорът е твърде дълъг. Моля, обадете се на +359 2 012 3456." }, 429);

  const messages = structuredClone(row.messages);
  const state = structuredClone(row.state);
  const usage = { ...emptyUsage(), ...row.usage };
  let reply: string, log: unknown;
  let saveMessages = true;
  try {
    const env = { chatId: row.id, takenSlots, bookSlot: (a: Parameters<typeof bookSlot>[1]) => bookSlot(row.id, a) };
    ({ reply, log } = await hansTurn(messages, state, text, env, usage));
  } catch (e) {
    // API down etc.: keep the stored conversation as it was (a half-finished tool loop must not be saved)
    saveMessages = false;
    reply = "Извинете, в момента имам технически проблем. Моля, опитайте отново след малко или ни се обадете на +359 2 012 3456.";
    log = { error: `${(e as Error).name}: ${(e as Error).message}` };
  }
  const transcript = [...row.transcript, { role: "user", text }, { role: "assistant", text: reply }];
  const update = {
    turns: row.turns + 1, transcript, usage, log: [...row.log, log], updated_at: new Date().toISOString(),
    ...(saveMessages ? { messages, state, outcome: outcome(state) } : {}),
  };
  // optimistic lock: refuse if another request for this chat finished in the meantime
  const { data: saved } = await g.sb.from("hans_chats").update(update).eq("id", row.id).eq("turns", row.turns).select("id");
  if (!saved?.length) return json({ error: "Моля, изчакайте отговора преди да пишете отново." }, 409);
  return json({ reply, state: publicState(saveMessages ? state : row.state) });
}

export async function feedback(req: Request) {
  const g = guard(req);
  if (g.error) return g.error;
  const b = await body(req);
  if (b.rating !== "up" && b.rating !== "down") return json({ error: "rating must be up or down" }, 400);
  const { data } = await g.sb.from("hans_chats").select("id,outcome").eq("id", String(b.chat_id ?? "")).maybeSingle();
  if (!data) return json({ error: "unknown chat" }, 404);
  await g.sb.from("hans_feedback").insert({ chat_id: data.id, rating: b.rating, comment: String(b.comment ?? "").slice(0, 500), outcome: data.outcome });
  return json({ ok: true });
}
