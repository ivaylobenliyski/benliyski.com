import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { authorized } from "@/lib/hans/auth";
import { db } from "@/lib/hans/db";
import { blockCount, filterQuery, handoffCount, loadChats, PAGE_SIZE, parseFilters, toolCallCount, toolFailCount, usd } from "@/lib/hans/review";
import s from "../../HansDemo.module.css";
import r from "../Review.module.css";

export const metadata: Metadata = { title: "Hans – conversations", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

const OUTCOMES = ["open", "quoted", "offer_emailed", "appointment", "handoff"];
const t = (iso: string) => new Date(iso).toLocaleString("sv-SE", { timeZone: "Europe/Sofia" }).slice(0, 16);

export default async function Chats({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!authorized((await headers()).get("authorization"))) notFound();
  const sb = db();
  if (!sb) return <div className={s.root}><div className={`${s.wrap} ${s.team}`}>Storage is not configured (SUPABASE_SERVICE_ROLE_KEY).</div></div>;
  const f = parseFilters(await searchParams);
  const { chats, total, feedback, capped } = await loadChats(sb, f);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(f.page, pages);
  const shown = chats.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const cost = chats.reduce((a, c) => a + usd(c.usage), 0);
  const fq = filterQuery({ ...f, page: 1 });

  return (
    <div className={s.root}>
      <div className={s.demoBanner}>Sales team view – AluPlast Demo (fictional company, university project)</div>
      <div className={`${s.wrap} ${s.team}`}>
        <p><Link href="/hans/team">← team overview</Link></p>
        <h1>Conversations</h1>

        <form className={r.filters} method="get" action="/hans/team/chats">
          <label>Words<input type="search" name="q" defaultValue={f.q ?? ""} placeholder="all words must appear" /></label>
          <label>Outcome
            <select name="outcome" defaultValue={f.outcome ?? ""}>
              <option value="">any</option>
              {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label>Feedback
            <select name="fb" defaultValue={f.fb ?? ""}>
              <option value="">any / none</option>
              <option value="down">👎 only</option>
              <option value="up">👍 only</option>
              <option value="any">has feedback</option>
            </select>
          </label>
          <label>From<input type="date" name="from" defaultValue={f.from ?? ""} /></label>
          <label>To<input type="date" name="to" defaultValue={f.to ?? ""} /></label>
          <label className={r.check}><input type="checkbox" name="blocked" value="1" defaultChecked={f.blocked} />checker blocks</label>
          <label className={r.check}><input type="checkbox" name="toolfail" value="1" defaultChecked={f.toolfail} />tool failures</label>
          <label className={r.check}><input type="checkbox" name="handoff" value="1" defaultChecked={f.handoff} />hand-offs</label>
          <button type="submit">Filter</button>
          <Link className={`${r.small} ${r.ghost}`} href="/hans/team/chats">Reset</Link>
        </form>

        <div className={r.bar}>
          <span><b>{total}</b> conversations · API cost ${cost.toFixed(2)}</span>
          <span>Export filtered: <a href={`/api/hans/team/export${filterQuery({ ...f, page: 1 }, { format: "json" })}`}>JSON</a> · <a href={`/api/hans/team/export${filterQuery({ ...f, page: 1 }, { format: "csv" })}`}>CSV (one row per turn)</a></span>
          {capped && <span className={`${r.badge} ${r.warnB}`}>only the newest 2000 chats were scanned – narrow the dates</span>}
        </div>

        <div className={s.scroll}><table className={s.table}><thead><tr>
          <th>Chat</th><th>Started (Sofia)</th><th>Outcome</th><th>Turns</th><th>First message</th><th>Feedback</th><th>Tools</th><th>Blocks</th><th>Tool fails</th><th>Hand-offs</th><th>Cost</th>
        </tr></thead><tbody>
          {shown.map((c) => {
            const fb = feedback.get(c.id) ?? [];
            const first = c.transcript?.find((l) => l.role === "user")?.text ?? "";
            const b = blockCount(c), tf = toolFailCount(c), h = handoffCount(c);
            return (
              <tr key={c.id}>
                <td className={r.mono}><Link href={`/hans/team/chats/${c.id}${fq}`}>{c.id}</Link></td>
                <td>{t(c.created_at)}</td>
                <td>{c.outcome}</td>
                <td className={r.num}>{c.turns}</td>
                <td>{first.length > 90 ? first.slice(0, 90) + "…" : first}</td>
                <td>{fb.map((x, i) => <span key={i} title={x.comment ?? ""}>{x.rating === "up" ? "👍" : "👎"}</span>)}</td>
                <td className={r.num}>{toolCallCount(c)}</td>
                <td className={r.num}>{b ? <span className={`${r.badge} ${r.bad}`}>{b}</span> : "–"}</td>
                <td className={r.num}>{tf ? <span className={`${r.badge} ${r.bad}`}>{tf}</span> : "–"}</td>
                <td className={r.num}>{h ? <span className={`${r.badge} ${r.warnB}`}>{h}</span> : "–"}</td>
                <td className={r.num}>${usd(c.usage).toFixed(3)}</td>
              </tr>
            );
          })}
          {!shown.length && <tr><td colSpan={11}>No conversations match these filters.</td></tr>}
        </tbody></table></div>

        {pages > 1 && (
          <div className={r.pager}>
            {page > 1 ? <Link href={`/hans/team/chats${filterQuery(f, { page: page - 1 })}`}>← newer</Link> : <span />}
            <span>page {page} of {pages}</span>
            {page < pages && <Link href={`/hans/team/chats${filterQuery(f, { page: page + 1 })}`}>older →</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
