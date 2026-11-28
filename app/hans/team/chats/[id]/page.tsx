import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { authorized } from "@/lib/hans/auth";
import { db } from "@/lib/hans/db";
import { blockCount, filterQuery, loadChat, parseFilters, PRICE, toolFailCount, turns, usd } from "@/lib/hans/review";
import s from "../../../HansDemo.module.css";
import r from "../../Review.module.css";

export const metadata: Metadata = { title: "Hans – conversation", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

const t = (iso: string) => new Date(iso).toLocaleString("sv-SE", { timeZone: "Europe/Sofia" }).slice(0, 16);
const pretty = (v: unknown) => (typeof v === "string" ? v : JSON.stringify(v, null, 2));

export default async function Chat({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!authorized((await headers()).get("authorization"))) notFound();
  const sb = db();
  if (!sb) return <div className={s.root}><div className={`${s.wrap} ${s.team}`}>Storage is not configured (SUPABASE_SERVICE_ROLE_KEY).</div></div>;
  const { id } = await params;
  const back = `/hans/team/chats${filterQuery({ ...parseFilters(await searchParams), page: 1 })}`;
  const found = /^[a-f0-9]{6,32}$/.test(id) ? await loadChat(sb, id) : null;
  if (!found) notFound();
  const { chat: c, feedback } = found;
  const { opening, turns: list } = turns(c);
  const u = c.usage ?? {};
  const st = c.state;

  return (
    <div className={s.root}>
      <div className={s.demoBanner}>Sales team view – AluPlast Demo (fictional company, university project)</div>
      <div className={`${s.wrap} ${s.team}`}>
        <p><Link href={back}>← all conversations</Link></p>
        <h1>Chat <span className={r.mono}>{c.id}</span></h1>
        <div className={r.bar}>
          <span>started {t(c.created_at)} · updated {t(c.updated_at)} (Sofia)</span>
          <span className={r.badge}>{c.outcome}</span>
          <span>{c.turns} customer messages</span>
          {blockCount(c) > 0 && <span className={`${r.badge} ${r.bad}`}>{blockCount(c)} checker blocks</span>}
          {toolFailCount(c) > 0 && <span className={`${r.badge} ${r.bad}`}>{toolFailCount(c)} tool failures</span>}
          <span>Export: <a href={`/api/hans/team/export?id=${c.id}&format=json`}>JSON</a> · <a href={`/api/hans/team/export?id=${c.id}&format=csv`}>CSV</a></span>
        </div>

        <div className={r.grid2}>
          <div className={r.box}>
            <h3>Tokens &amp; cost</h3>
            <dl className={r.dl}>
              <dt>API requests</dt><dd>{u.requests ?? 0}</dd>
              <dt>Input</dt><dd>{u.input ?? 0}</dd>
              <dt>Output</dt><dd>{u.output ?? 0}</dd>
              <dt>Cache read</dt><dd>{u.cache_read ?? 0}</dd>
              <dt>Cache write</dt><dd>{u.cache_write ?? 0}</dd>
              <dt>Cost</dt><dd><b>${usd(u).toFixed(4)}</b></dd>
            </dl>
            <p className={s.note}>List price per 1M tokens: in ${PRICE.input}, out ${PRICE.output}, cache read ${PRICE.cache_read}, cache write ${PRICE.cache_write}.</p>
          </div>
          <div className={r.box}>
            <h3>Feedback</h3>
            {feedback.length ? feedback.map((f, i) => (
              <p key={i} style={{ margin: "0 0 6px" }}>{f.rating === "up" ? "👍" : "👎"} {f.comment || <i>no comment</i>} <span className={s.note}>({f.outcome}, {t(f.created_at)})</span></p>
            )) : <p>–</p>}
          </div>
          <div className={r.box}>
            <h3>Contact</h3>
            {Object.keys(st?.contact ?? {}).length ? (
              <dl className={r.dl}>{Object.entries(st.contact).map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl>
            ) : <p>–</p>}
          </div>
        </div>

        <h2>Conversation</h2>
        {opening && <div className={r.turn}><p className={`${r.say} ${r.hans}`}><span className={r.who}>Hans (opening)</span>{opening}</p></div>}
        {list.map((tn) => {
          const calls = tn.log?.tool_calls ?? [];
          const checks = tn.log?.checks ?? [];
          const blocked = checks.filter((x) => x.problems?.length);
          return (
            <div key={tn.n} className={r.turn} id={`turn-${tn.n}`}>
              <div className={r.turnHead}>
                <b>Turn {tn.n}</b>
                {calls.map((x, i) => <span key={i} className={`${r.badge} ${x.error ? r.bad : ""}`}>{x.tool}{x.error ? " ✗" : ""}</span>)}
                {blocked.length > 0 && <span className={`${r.badge} ${r.bad}`}>{blocked.length} blocked → rewritten</span>}
                {tn.log?.error && <span className={`${r.badge} ${r.bad}`}>turn error</span>}
              </div>
              <p className={`${r.say} ${r.cust}`}><span className={r.who}>Customer</span>{tn.user}</p>
              {blocked.map((b, i) => (
                <div key={i}>
                  <p className={`${r.say} ${r.draft}`}><span className={r.who}>Blocked draft {i + 1} (not shown to the customer)</span>{b.reply}</p>
                  <ul className={r.problems}>{b.problems.map((p, j) => <li key={j}>{p}</li>)}</ul>
                </div>
              ))}
              <p className={`${r.say} ${r.hans}`}><span className={r.who}>Hans{blocked.length ? " (corrected reply shown to the customer)" : ""}</span>{tn.reply}</p>
              {(calls.length > 0 || tn.log?.error) && (
                <details className={r.trace}>
                  <summary>Tool calls ({calls.length})</summary>
                  {tn.log?.error && <pre>{tn.log.error}</pre>}
                  {calls.map((x, i) => (
                    <div key={i}>
                      <b className={r.mono}>{x.tool}</b>{x.error && <span className={`${r.badge} ${r.bad}`}> error</span>}
                      <pre>{`input:\n${pretty(x.input)}\n\noutput (first 500 chars):\n${x.output}`}</pre>
                    </div>
                  ))}
                </details>
              )}
            </div>
          );
        })}

        <h2>What Hans produced</h2>
        <details className={r.trace}><summary>Quotes ({st?.quotes?.length ?? 0})</summary><pre>{pretty(st?.quotes ?? [])}</pre></details>
        <details className={r.trace}><summary>E-mails ({st?.emailsSent?.length ?? 0})</summary>
          {(st?.emailsSent ?? []).map((m, i) => <pre key={i}>{`${m.at} → ${m.to}\nSubject: ${m.subject}\n\n${m.body}`}</pre>)}
        </details>
        <details className={r.trace}><summary>Appointments ({st?.appointments?.length ?? 0})</summary><pre>{pretty(st?.appointments ?? [])}</pre></details>
        <details className={r.trace}><summary>Hand-offs ({st?.handoffs?.length ?? 0})</summary><pre>{pretty(st?.handoffs ?? [])}</pre></details>
        <details className={r.trace}><summary>Raw model history ({c.messages?.length ?? 0} messages)</summary><pre>{pretty(c.messages ?? [])}</pre></details>
      </div>
    </div>
  );
}
