"use client";

import { useState } from "react";
import s from "./HansDemo.module.css";

export type ProductType = { code: string; name: string; min_w: number; max_w: number; min_h: number; max_h: number };
type Row = { key: number; type: string; w: string; h: string; qty: number };

const QTY = Array.from({ length: 20 }, (_, i) => i + 1);
const MAX_ROWS = 10;
const num = (v: string) => Number(v.replace(",", "."));

/**
 * Quick-quote form shown at the start of the chat: product type, width, height and quantity per row, "+" adds a
 * row. Submits one message that starts with `prefix`; agent.md tells Hans how to handle it (quote right away).
 */
export default function QuickForm({ types, prefix, disabled, onSubmit, onSkip }: {
  types: ProductType[]; prefix: string; disabled: boolean; onSubmit: (text: string) => void; onSkip: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([{ key: 0, type: types[0]?.code ?? "", w: "", h: "", qty: 1 }]);
  const [tried, setTried] = useState(false);
  const byCode = new Map(types.map((t) => [t.code, t]));

  const set = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const add = () => setRows((rs) => (rs.length >= MAX_ROWS ? rs : [...rs, { ...rs[rs.length - 1], key: Math.max(...rs.map((r) => r.key)) + 1, w: "", h: "", qty: 1 }]));
  const remove = (key: number) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));

  const invalid = (r: Row) => !(num(r.w) > 0 && num(r.w) < 10000 && num(r.h) > 0 && num(r.h) < 10000);
  const outside = (r: Row) => {
    const t = byCode.get(r.type);
    return !!t && !invalid(r) && (num(r.w) < t.min_w || num(r.w) > t.max_w || num(r.h) < t.min_h || num(r.h) > t.max_h);
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (disabled || rows.some(invalid)) return;
    const lines = rows.map((r) => `- ${r.qty} × ${byCode.get(r.type)?.name ?? r.type}, ${num(r.w)} × ${num(r.h)} см`);
    onSubmit([prefix, ...lines].join("\n"));
  }

  return (
    <form className={s.qf} onSubmit={submit} aria-label="Форма за бърза оферта">
      <h4>Бърза оферта</h4>
      <p className={s.qfHint}>Изберете продукт, размерите на отвора в сантиметри и броя. С „+“ добавяте още позиции.</p>
      {rows.map((r, i) => {
        const t = byCode.get(r.type);
        return (
          <fieldset key={r.key} className={s.qfRow} aria-label={`Позиция ${i + 1}`}>
            <label className={s.qfType}>
              <select aria-label="Продукт" value={r.type} onChange={(e) => set(r.key, { type: e.target.value })}>
                {types.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
              </select>
            </label>
            <label><span>Ширина, см</span>
              <input inputMode="decimal" value={r.w} placeholder={t ? `${t.min_w}–${t.max_w}` : ""} aria-invalid={tried && invalid(r)}
                onChange={(e) => set(r.key, { w: e.target.value.replace(/[^\d.,]/g, "").slice(0, 6) })} />
            </label>
            <label><span>Височина, см</span>
              <input inputMode="decimal" value={r.h} placeholder={t ? `${t.min_h}–${t.max_h}` : ""} aria-invalid={tried && invalid(r)}
                onChange={(e) => set(r.key, { h: e.target.value.replace(/[^\d.,]/g, "").slice(0, 6) })} />
            </label>
            <label><span>Брой</span>
              <select value={r.qty} onChange={(e) => set(r.key, { qty: Number(e.target.value) })}>
                {QTY.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            {rows.length > 1 && <button type="button" className={s.qfDel} onClick={() => remove(r.key)} aria-label={`Премахни позиция ${i + 1}`}>✕</button>}
            {tried && invalid(r) && <p className={s.qfErr}>Моля, въведете ширина и височина в см.</p>}
            {outside(r) && <p className={s.qfWarn}>Извън стандартните размери ({t!.min_w}–{t!.max_w} × {t!.min_h}–{t!.max_h} см) – колега ще Ви помогне.</p>}
          </fieldset>
        );
      })}
      <div className={s.qfActions}>
        {rows.length < MAX_ROWS && <button type="button" className={s.qfAdd} onClick={add}>＋ Добави позиция</button>}
        <button type="submit" className={s.send} disabled={disabled}>Изчисли оферта</button>
      </div>
      <button type="button" className={s.linkBtn} onClick={onSkip}>Само имам въпрос – ще пиша в чата</button>
    </form>
  );
}
