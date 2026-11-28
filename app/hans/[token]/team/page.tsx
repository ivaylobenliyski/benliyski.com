import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MODEL } from "@/lib/hans/agent";
import { validToken } from "@/lib/hans/auth";
import { db } from "@/lib/hans/db";
import type { HansState } from "@/lib/hans/state";
import s from "../HansDemo.module.css";

export const metadata: Metadata = { title: "Hans – sales team view", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

// List prices per 1M tokens (USD) for the default model, Nov 2026 – update if the model or prices change.
const PRICE = { input: 4, output: 20, cache_read: 0.2, cache_write: 5 };
type Usage = { input: number; output: number; cache_read: number; cache_write: number; requests: number };
type Chat = { id: string; created_at: string; updated_at: string; outcome: string; turns: number; state: HansState; usage: Usage };
type Fb = { chat_id: string; rating: string; comment: string | null; outcome: string; created_at: string };

const usd = (u: Usage) => (u.input * PRICE.input + u.output * PRICE.output + u.cache_read * PRICE.cache_read + u.cache_write * PRICE.cache_write) / 1e6;
const t = (iso: string) => iso.slice(0, 16).replace("T", " ");

export default async function Team({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!validToken(token)) notFound();
  const sb = db();
  if (!sb) return <div className={s.root}><div className={`${s.wrap} ${s.team}`}>Storage is not configured (SUPABASE_SERVICE_ROLE_KEY).</div></div>;
  const [{ data: chatsData }, { data: fbData }] = await Promise.all([
    sb.from("hans_chats").select("id,created_at,updated_at,outcome,turns,state,usage").order("updated_at", { ascending: false }).limit(200),
    sb.from("hans_feedback").select("chat_id,rating,comment,outcome,created_at").order("created_at", { ascending: false }).limit(200),
  ]);
  const chats = (chatsData ?? []) as Chat[];
  const fb = (fbData ?? []) as Fb[];
  const active = chats.filter((c) => c.turns > 0);
  const totalCost = active.reduce((a, c) => a + usd(c.usage ?? ({} as Usage)), 0);
  const completed = active.filter((c) => ["offer_emailed", "appointment"].includes(c.outcome));
  const up = fb.filter((f) => f.rating === "up").length;
  const appts = chats.flatMap((c) => (c.state.appointments ?? []).map((a) => ({ ...a, chat: c.id }))).sort((a, b) => a.slot.localeCompare(b.slot));
  const tickets = chats.flatMap((c) => (c.state.handoffs ?? []).map((h) => ({ ...h, chat: c.id })));
  const mails = chats.flatMap((c) => (c.state.emailsSent ?? []).map((m) => ({ ...m, chat: c.id })));

  return (
    <div className={s.root} lang="bg">
      <div className={s.demoBanner}>Sales team view – AluPlast Demo (fictional company, university project)</div>
      <div className={`${s.wrap} ${s.team}`}>
        <p><a href={`/hans/${token}`}>← back to the demo website</a></p>
        <h1>What Hans produced</h1>
        <div className={s.kpis}>
          <span>Conversations: <b>{active.length}</b></span>
          <span>Offer / appointment: <b>{completed.length}</b></span>
          <span>Offers e-mailed: <b>{mails.length}</b></span>
          <span>Appointments: <b>{appts.length}</b></span>
          <span>Hand-offs: <b>{tickets.length}</b></span>
          <span>Feedback: <b>{up} 👍 / {fb.length - up} 👎</b></span>
          <span>API cost: <b>${totalCost.toFixed(2)}</b> (avg ${active.length ? (totalCost / active.length).toFixed(3) : "0"} / conversation)</span>
        </div>
        <p className={s.note}>Model: {MODEL}. Cost = measured tokens × list price (input ${PRICE.input}, output ${PRICE.output}, cache read ${PRICE.cache_read}, cache write ${PRICE.cache_write} per 1M tokens). Human baseline: €7.50 per request.</p>

        <h2>Leads</h2>
        <div className={s.scroll}><table className={s.table}><thead><tr><th>Lead</th><th>Updated</th><th>Outcome</th><th>Msgs</th><th>Contact</th><th>Range</th><th>Tokens in / out / cached</th><th>Cost</th></tr></thead><tbody>
          {active.map((c) => {
            const q = c.state.quotes?.at(-1);
            const u = c.usage ?? ({} as Usage);
            return (<tr key={c.id}><td>{c.id}</td><td>{t(c.updated_at)}</td><td>{c.outcome}</td><td>{c.turns}</td>
              <td>{Object.entries(c.state.contact ?? {}).map(([k, v]) => `${k}: ${v}`).join(", ")}</td>
              <td>{q ? `${q.range_low} – ${q.range_high} €` : "–"}</td>
              <td>{u.input ?? 0} / {u.output ?? 0} / {u.cache_read ?? 0}</td><td>${usd(u).toFixed(3)}</td></tr>);
          })}
        </tbody></table></div>

        <h2>Appointments</h2>
        <div className={s.scroll}><table className={s.table}><thead><tr><th>When</th><th>Type</th><th>Name</th><th>Phone</th><th>Address</th><th>Lead</th></tr></thead><tbody>
          {appts.map((a) => <tr key={a.kind + a.slot}><td>{a.slot}</td><td>{a.kind}</td><td>{a.name}</td><td>{a.phone}</td><td>{a.address}</td><td>{a.chat}</td></tr>)}
        </tbody></table></div>

        <h2>Hand-offs</h2>
        <div className={s.scroll}><table className={s.table}><thead><tr><th>Ticket</th><th>Reason</th><th>Summary</th><th>At</th></tr></thead><tbody>
          {tickets.map((x) => <tr key={x.id}><td>{x.id}</td><td>{x.reason}</td><td>{x.summary}</td><td>{x.at}</td></tr>)}
        </tbody></table></div>

        <h2>Offer e-mails (demo outbox – not really sent)</h2>
        {mails.length ? mails.map((m, i) => (
          <details key={i}><summary>{m.at} → {m.to} ({m.chat})</summary><pre className={s.pre}>{`Subject: ${m.subject}\n\n${m.body}`}</pre></details>
        )) : <p>–</p>}

        <h2>Feedback</h2>
        <div className={s.scroll}><table className={s.table}><thead><tr><th>Lead</th><th>Rating</th><th>Comment</th><th>Outcome</th><th>At</th></tr></thead><tbody>
          {fb.map((f, i) => <tr key={i}><td>{f.chat_id}</td><td>{f.rating === "up" ? "👍" : "👎"}</td><td>{f.comment}</td><td>{f.outcome}</td><td>{t(f.created_at)}</td></tr>)}
        </tbody></table></div>
      </div>
    </div>
  );
}
