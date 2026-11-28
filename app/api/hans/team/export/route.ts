import { authorized } from "@/lib/hans/auth";
import { db } from "@/lib/hans/db";
import { loadChat, loadChats, parseFilters, toCsv, turns, usd, type ChatRow, type Feedback } from "@/lib/hans/review";

// Hans demo (university project) – conversation export for the sales team, password-protected (see proxy.ts).
// ?format=json|csv plus the same filters as /hans/team/chats, or ?id=<chat> for one conversation.
// Contact data is included (demo data is fictional; retention is 2 years).
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };

export async function GET(req: Request) {
  if (!authorized(req.headers.get("authorization"))) return new Response("unauthorized", { status: 401, headers: HEADERS });
  const sb = db();
  if (!sb) return new Response("storage not configured (SUPABASE_SERVICE_ROLE_KEY)", { status: 503, headers: HEADERS });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const format = sp.format === "csv" ? "csv" : "json";

  let chats: ChatRow[], feedback: Map<string, Feedback[]>;
  if (sp.id) {
    const one = /^[a-f0-9]{6,32}$/.test(sp.id) ? await loadChat(sb, sp.id) : null;
    if (!one) return new Response("unknown chat", { status: 404, headers: HEADERS });
    chats = [one.chat];
    feedback = new Map([[one.chat.id, one.feedback]]);
  } else {
    ({ chats, feedback } = await loadChats(sb, parseFilters(sp), format === "json"));
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const name = sp.id ? `hans-chat-${sp.id}` : `hans-chats-${stamp}`;
  if (format === "csv") {
    return new Response("﻿" + toCsv(chats, feedback), { // BOM so Excel reads Cyrillic as UTF-8
      headers: { ...HEADERS, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}.csv"` },
    });
  }
  const body = {
    exported_at: new Date().toISOString(),
    filters: sp,
    count: chats.length,
    chats: chats.map((c) => ({
      ...c,
      cost_usd: Number(usd(c.usage).toFixed(4)),
      feedback: feedback.get(c.id) ?? [],
      turns_view: turns(c).turns, // customer message + reply + that turn's tool calls / checker results
    })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { ...HEADERS, "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="${name}.json"` },
  });
}
