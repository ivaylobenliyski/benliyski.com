"use client";

import { useEffect, useRef, useState } from "react";
import s from "./HansDemo.module.css";

type Line = { description: string; quantity: number; total: string };
type Quote = { lines: Line[]; discount_pct: number; discount_amount: string; range_low: string; range_high: string; earliest_delivery: string };
type State = { quote: Quote | null; emails_sent: { to: string; at: string }[]; appointments: { kind: string; slot: string }[]; handoff: boolean; outcome: string };
type Item = { id: number; kind: "bot" | "me" | "event" | "warn" | "offer"; text?: string; quote?: Quote };

const CHIPS = ["Искам оферта за прозорци", "Как да измеря прозореца?", "Какви стъклопакети имате?"];
const fmt = (n: string) => Number(n).toLocaleString("bg-BG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
const fmt0 = (n: string) => Number(n).toLocaleString("bg-BG", { maximumFractionDigits: 0 }) + " €";
const when = (slot: string) =>
  new Date(slot.replace(" ", "T")).toLocaleDateString("bg-BG", { weekday: "short", day: "2-digit", month: "2-digit" }) + ", " + slot.slice(11);

export default function HansDemo() {
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [notice, setNotice] = useState("Разговаряте с AI асистент.");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [chips, setChips] = useState(true);
  const [fbOpen, setFbOpen] = useState(false);
  const [fbDone, setFbDone] = useState(false);
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [comment, setComment] = useState("");
  const [fbMsg, setFbMsg] = useState("Беше ли полезен разговорът?");
  const seen = useRef(new Set<string>());
  const nextId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launchRef = useRef<HTMLButtonElement>(null);

  const add = (...xs: Omit<Item, "id">[]) => setItems((cur) => [...cur, ...xs.map((x) => ({ ...x, id: nextId.current++ }))]);

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight }); }, [items, busy]);

  async function api(path: string, body: object) {
    const r = await fetch(`/api/hans/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || "Грешка");
    return data;
  }

  function applyState(st: State) {
    const out: Omit<Item, "id">[] = [];
    if (st.quote) {
      const k = "q:" + JSON.stringify(st.quote);
      if (!seen.current.has(k)) { seen.current.add(k); out.push({ kind: "offer", quote: st.quote }); }
    }
    for (const m of st.emails_sent) {
      const k = "m:" + m.at + m.to;
      if (!seen.current.has(k)) { seen.current.add(k); out.push({ kind: "event", text: `✓ Офертата е изпратена на ${m.to}` }); }
    }
    for (const a of st.appointments) {
      const k = "a:" + a.kind + a.slot;
      if (!seen.current.has(k)) { seen.current.add(k); out.push({ kind: "event", text: `✓ ${a.kind === "call" ? "Обаждане" : "Оглед"}: ${when(a.slot)}` }); }
    }
    if (st.handoff && !seen.current.has("h")) { seen.current.add("h"); out.push({ kind: "event", text: "✓ Предадено на колега" }); }
    if (out.length) add(...out);
    if (["offer_emailed", "appointment", "handoff"].includes(st.outcome)) setFbOpen(true);
  }

  async function openChat() {
    setOpen(true);
    if (chatId) return;
    try {
      const d = await api("start", {});
      setChatId(d.chat_id);
      setNotice(d.notice);
      add({ kind: "bot", text: d.reply });
    } catch (e) {
      add({ kind: "warn", text: "⚠ " + (e as Error).message });
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function closeChat() { setOpen(false); setTimeout(() => launchRef.current?.focus(), 50); }

  async function send(msg: string) {
    msg = msg.trim();
    if (!msg || busy || !chatId) return;
    setBusy(true); setChips(false); setText("");
    add({ kind: "me", text: msg });
    try {
      const d = await api("message", { chat_id: chatId, text: msg });
      add({ kind: "bot", text: d.reply });
      applyState(d.state);
    } catch (e) {
      add({ kind: "warn", text: "⚠ " + (e as Error).message });
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  async function sendFeedback() {
    if (!rating) { setFbMsg("Моля, изберете 👍 или 👎"); return; }
    try {
      await api("feedback", { chat_id: chatId, rating, comment });
      setFbDone(true);
    } catch { setFbMsg("Неуспешно изпращане, опитайте пак."); }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) closeChat(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className={s.root} lang="bg">
      <div className={s.demoBanner}>Демонстрация: AluPlast Demo е измислена фирма – университетски проект. Не е свързана с реален производител.</div>
      <header className={s.siteHeader}><div className={s.wrap}>
        <span className={s.logo}>
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect x="2" y="2" width="26" height="26" rx="4" fill="#0d4a6b" /><rect x="6" y="6" width="8" height="18" rx="1" fill="#9fd3ee" /><rect x="16" y="6" width="8" height="18" rx="1" fill="#9fd3ee" /></svg>
          AluPlast Demo <small>демо</small>
        </span>
        <nav className={s.nav} aria-label="Навигация на демото">
          <a href="#products">Продукти</a><a href="#glass">Стъклопакети</a><a href="#about">Защо ние</a><a href="#contact">Контакти</a>
          <a href="/hans/team">Екип (демо)</a>
        </nav>
      </div></header>

      <section className={s.hero}><div className={s.wrap}>
        <h1>Топли PVC прозорци, изработени и монтирани от нашите екипи</h1>
        <p>Получете ориентировъчна оферта за минути – денонощно, от нашия AI асистент Ханс. Безплатен оглед и замерване в цялата страна.</p>
        <button className={s.btn} type="button" onClick={openChat}>Поискайте оферта от Ханс</button>
      </div></section>

      <section id="about" className={s.section}><div className={`${s.wrap} ${s.grid}`}>
        <div className={`${s.card} ${s.feature}`}><div className={s.ic}>1</div><div><h3>Безплатен оглед</h3><p>Техник замерва всеки отвор и Ви съветва – без ангажимент.</p></div></div>
        <div className={`${s.card} ${s.feature}`}><div className={s.ic}>3</div><div><h3>Доставка от 3 седмици</h3><p>Изработка по мярка и монтаж – обикновено за 3 до 5 седмици.</p></div></div>
        <div className={`${s.card} ${s.feature}`}><div className={s.ic}>10</div><div><h3>10 години гаранция</h3><p>На профила; 5 години на обкова и стъклопакета.</p></div></div>
      </div></section>

      <section id="products" className={`${s.section} ${s.white}`}><div className={s.wrap}>
        <h2 className={s.h2}>Продукти</h2>
        <div className={s.grid}>
          <div className={s.card}><h3>Фиксиран прозорец</h3><p>Не се отваря. За големи остъклени площи.</p><p className={s.price}>от 95 €/м²</p></div>
          <div className={s.card}><h3>Отваряне и обръщане</h3><p>Най-популярният избор за дома – две функции с една дръжка.</p><p className={s.price}>от 135 €/м²</p></div>
          <div className={s.card}><h3>Балконска врата</h3><p>Крило с височина на врата, обикновено с отваряне и обръщане.</p><p className={s.price}>от 150 €/м²</p></div>
          <div className={s.card}><h3>Плъзгаща система</h3><p>За широки отвори към тераса.</p><p className={s.price}>от 220 €/м²</p></div>
        </div>
        <p className={s.note}>Цените са с ДДС и стандартен монтаж, с двоен стъклопакет. Окончателна цена след оглед.</p>
      </div></section>

      <section id="glass" className={s.section}><div className={s.wrap}>
        <h2 className={s.h2}>Стъклопакети</h2>
        <div className={s.grid}>
          <div className={s.card}><h3>Двоен (4-16-4)</h3><p>Стандартният избор.</p></div>
          <div className={s.card}><h3>Четирисезонен (Low-E)</h3><p>По-добра изолация зиме и по-малко топлина лете.</p><p className={s.price}>+8 €/м²</p></div>
          <div className={s.card}><h3>Троен</h3><p>Най-добра топло- и шумоизолация.</p><p className={s.price}>+40 €/м²</p></div>
          <div className={s.card}><h3>Ламиниран</h3><p>Безопасност и защита от взлом.</p><p className={s.price}>+35 €/м²</p></div>
        </div>
      </div></section>

      <footer id="contact" className={s.siteFooter}><div className={s.wrap}>
        <div><strong>AluPlast Demo ЕООД</strong> (измислена фирма)<br />Индустриална зона „Изток“, ул. „Демо“ 12, София</div>
        <div>Тел.: +359 2 012 3456<br />Имейл: oferti@aluplast-demo.example</div>
        <div>Шоурум: пон–пет 09:00–18:00, съб 10:00–14:00<br />Ханс отговаря денонощно.</div>
      </div></footer>

      {!open && (
        <button ref={launchRef} className={`${s.btn} ${s.launch}`} type="button" onClick={openChat} aria-expanded="false">💬 Попитайте Ханс</button>
      )}
      {open && (
        <div className={s.panel} role="dialog" aria-label="Чат с Ханс, AI асистент">
          <div className={s.head}>
            <div className={s.avatar} aria-hidden="true">H</div>
            <div className={s.who}><b>Ханс <span className={s.aiTag}>AI</span></b><span className={s.sub}>Виртуален асистент · AluPlast Demo</span></div>
            <button className={s.close} type="button" onClick={closeChat} aria-label="Затвори чата">×</button>
          </div>
          <div className={s.notice}>{notice}</div>
          <div className={s.log} ref={logRef} role="log" aria-live="polite">
            {items.map((it) =>
              it.kind === "offer" && it.quote ? (
                <div key={it.id} className={s.offer}>
                  <h4>Ориентировъчна оферта</h4>
                  <table><tbody>
                    {it.quote.lines.map((l, i) => (<tr key={i}><td>{l.quantity} × {l.description}</td><td>{fmt(l.total)}</td></tr>))}
                    {it.quote.discount_pct > 0 && (<tr><td>Отстъпка {it.quote.discount_pct}%</td><td>−{fmt(it.quote.discount_amount)}</td></tr>)}
                  </tbody></table>
                  <div className={s.range}>{fmt0(it.quote.range_low)} – {fmt0(it.quote.range_high)}</div>
                  <div className={s.fine}>С ДДС и монтаж · ±15% · окончателна цена след оглед · доставка най-рано {it.quote.earliest_delivery.split("-").reverse().join(".")}</div>
                </div>
              ) : (
                <div key={it.id} className={it.kind === "bot" ? `${s.msg} ${s.bot}` : it.kind === "me" ? `${s.msg} ${s.me}` : it.kind === "warn" ? `${s.event} ${s.warn}` : s.event}>{it.text}</div>
              ),
            )}
            {busy && <div className={s.typing}>Ханс пише…</div>}
          </div>
          {chips && chatId && (
            <div className={s.chips}>{CHIPS.map((c) => <button key={c} className={s.chip} type="button" onClick={() => send(c)}>{c}</button>)}</div>
          )}
          {fbOpen && (
            <div className={s.feedback}>
              {fbDone ? <p>Благодарим за оценката!</p> : (<>
                <p>{fbMsg}</p>
                <div className={s.rate}>
                  <button type="button" aria-pressed={rating === "up"} aria-label="Да, полезен" onClick={() => setRating("up")}>👍</button>
                  <button type="button" aria-pressed={rating === "down"} aria-label="Не, не беше полезен" onClick={() => setRating("down")}>👎</button>
                </div>
                <label className={s.srOnly} htmlFor="hans-fb">Коментар (по желание)</label>
                <input id="hans-fb" maxLength={500} placeholder="Коментар (по желание)" value={comment} onChange={(e) => setComment(e.target.value)} />
                <button className={s.fbSend} type="button" onClick={sendFeedback}>Изпрати оценка</button>
              </>)}
            </div>
          )}
          <form className={s.inputRow} onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <label className={s.srOnly} htmlFor="hans-text">Вашето съобщение</label>
            <textarea id="hans-text" ref={inputRef} maxLength={1000} placeholder="Напишете съобщение…" rows={1} value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }} />
            <button className={s.send} type="submit" disabled={busy || !chatId}>Изпрати</button>
          </form>
          <div className={s.foot}><span>Enter – изпращане · Shift+Enter – нов ред</span><button className={s.linkBtn} type="button" onClick={() => setFbOpen(true)}>Приключи и оцени</button></div>
        </div>
      )}
    </div>
  );
}
