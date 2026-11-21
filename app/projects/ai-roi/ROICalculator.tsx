"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import CashFlowChart, { COLOR_BENEFIT, COLOR_COST } from "./CashFlowChart";
import { LangSwitch, translateText, useI18n } from "./i18n";
import {
  CURRENCIES,
  MAX_YEARS,
  METHODS,
  SCENARIOS,
  calculate,
  exampleModel,
  emptyModel,
  newBenefit,
  newExpense,
  normalizeModel,
  uid,
  type Benefit,
  type Expense,
  type MethodId,
  type Model,
  type Result,
  type Settings,
} from "./model";

const STORAGE_KEY = "ai-roi:v1";
const ADD_TYPE = "__add__";

/* ---------- small UI helpers ---------- */

const card = "bg-card border border-line rounded-2xl p-5 sm:p-6";
const label = "block font-tech text-xs text-fg/60 mb-1";
const input =
  "w-full bg-bg border border-line rounded-lg px-3 py-2 font-tech text-sm text-fg placeholder:text-fg/35 focus:border-fg/50 outline-none";
const btn = "inline-flex items-center gap-2 font-tech text-sm font-semibold px-4 py-2.5 rounded-full transition-colors";
const btnGhost = `${btn} border border-fg/30 text-fg hover:border-fg`;
const sectionTitle = "font-tech text-xs text-sage uppercase tracking-[0.18em]";

/** Number input that tolerates empty / partial typing without snapping to 0. */
function Num({
  value,
  onChange,
  step,
  min,
  max,
  className = input,
  ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const [text, setText] = useState(String(value));
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    if (Number(text) !== value) setText(String(value));
  }
  return (
    <input
      type="number"
      inputMode="decimal"
      className={`${className} tabular-nums`}
      value={text}
      step={step ?? "any"}
      min={min}
      max={max}
      aria-label={ariaLabel}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseFloat(e.target.value);
        onChange(Number.isFinite(n) ? n : 0);
      }}
    />
  );
}

function Field({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block min-w-0">
      <span className={label}>{title}</span>
      {children}
      {hint && <span className="block font-tech text-[11px] text-fg/40 mt-1">{hint}</span>}
    </label>
  );
}

function TypeSelect({
  value,
  options,
  onChange,
  onAdd,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  onAdd: (v: string) => void;
}) {
  const { t } = useI18n();
  const all = options.includes(value) ? options : [value, ...options];
  return (
    <select
      className={input}
      value={value}
      onChange={(e) => {
        if (e.target.value === ADD_TYPE) {
          const name = prompt("Име на новия тип")?.trim();
          if (name) {
            onAdd(name);
            onChange(name);
          }
        } else onChange(e.target.value);
      }}
    >
      {all.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
      <option value={ADD_TYPE}>{t("＋ Нов тип…")}</option>
    </select>
  );
}

function download(content: string, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "ai-roi";

/* ---------- main component ---------- */

export default function ROICalculator() {
  const { t, lang } = useI18n();
  const [model, setModel] = useState<Model>(exampleModel);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
      if (raw) setModel(normalizeModel(JSON.parse(raw)));
    } catch {
      /* storage unavailable or corrupt — keep the example */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
    } catch {
      /* ignore */
    }
  }, [model, loaded]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(t);
  }, [notice]);

  const { settings: s, expenses, benefits } = model;
  const result = useMemo(() => calculate(model), [model]);
  const scenarioResults = useMemo(
    () => SCENARIOS.map((sc) => ({ ...sc, r: calculate(model, sc.id) })),
    [model],
  );

  const money = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-GB", { style: "currency", currency: s.currency, maximumFractionDigits: 0 });
    } catch {
      return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
    }
  }, [s.currency]);
  // Hand-rolled compact format: Intl's compact notation differs between Node and browsers (hydration mismatch).
  const symbol = useMemo(() => money.formatToParts(0).find((p) => p.type === "currency")?.value ?? "", [money]);
  const fmtShort = (n: number) => {
    const a = Math.abs(n);
    const sign = n < 0 ? "-" : "";
    const body =
      a >= 1e6 ? `${+(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${+(a / 1e3).toFixed(a >= 1e5 ? 0 : 1)}k` : `${Math.round(a)}`;
    return `${sign}${symbol}${body}`;
  };
  const fmt = (n: number) => money.format(Math.round(n) || 0);
  const pct = (n: number | null) => (n === null ? "—" : `${(n * 100).toFixed(0)}%`);
  const payback = (m: number | null) =>
    m === null ? `${t("Не в рамките на")} ${s.years} ${t("г.")}` : m < 1 ? t("Веднага") : m < 24 ? `${m.toFixed(1)} ${t("месеца")}` : `${(m / 12).toFixed(1)} ${t("години")}`;

  /* ----- updaters ----- */
  const setSettings = (patch: Partial<Settings>) => setModel((m) => ({ ...m, settings: { ...m.settings, ...patch } }));
  const setExpense = (id: string, patch: Partial<Expense>) =>
    setModel((m) => ({ ...m, expenses: m.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const setBenefit = (id: string, patch: Partial<Benefit>) =>
    setModel((m) => ({ ...m, benefits: m.benefits.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const addExpenseType = (t: string) =>
    setModel((m) => (m.settings.expenseTypes.includes(t) ? m : { ...m, settings: { ...m.settings, expenseTypes: [...m.settings.expenseTypes, t] } }));
  const addBenefitType = (t: string) =>
    setModel((m) => (m.settings.benefitTypes.includes(t) ? m : { ...m, settings: { ...m.settings, benefitTypes: [...m.settings.benefitTypes, t] } }));
  const duplicate = <T extends { id: string; name: string }>(list: T[], id: string): T[] => {
    const i = list.findIndex((x) => x.id === id);
    if (i < 0) return list;
    const copy = { ...structuredClone(list[i]), id: uid(), name: `${list[i].name} ${t("(копие)")}` };
    return [...list.slice(0, i + 1), copy, ...list.slice(i + 1)];
  };

  /* ----- language ----- */
  // Translate the built-in example and default categories into the current language.
  // Text the user typed is not in the dictionary, so it passes through unchanged.
  useEffect(() => {
    const tr = (x: string) => translateText(x, lang);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keep built-in strings in step with the chosen language
    setModel((m) => ({
      settings: {
        ...m.settings,
        name: tr(m.settings.name),
        expenseTypes: m.settings.expenseTypes.map(tr),
        benefitTypes: m.settings.benefitTypes.map(tr),
      },
      expenses: m.expenses.map((e) => ({ ...e, name: tr(e.name), type: tr(e.type) })),
      benefits: m.benefits.map((b) => ({
        ...b,
        name: tr(b.name),
        type: tr(b.type),
        factors: b.factors.map((f) => ({ ...f, label: tr(f.label) })),
      })),
    }));
  }, [lang, loaded]);

  /* ----- file actions ----- */
  const filename = slug(s.name || "ai-roi");
  const exportJson = () => download(JSON.stringify(model, null, 2), "application/json", `${filename}.json`);
  const exportCsv = () => {
    const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const lines: string[] = [];
    lines.push(q(s.name || t("ROI на ИИ инициатива")));
    lines.push([q(t("Сценарий")), q(s.scenario), q(t("Валута")), q(s.currency), q(t("Дисконтов процент %")), s.discountRate, q(t("Резерв за разходи %")), s.contingency].join(","));
    lines.push("");
    lines.push([t("Година"), t("Ползи"), t("Разходи"), t("Нето"), t("Кумулативно"), t("Меки ползи (справочно)")].map(q).join(","));
    for (const row of result.rows)
      lines.push([row.year === 0 ? t("Старт") : row.year, r2(row.benefits), r2(row.costs), r2(row.net), r2(row.cumulative), r2(row.soft)].join(","));
    lines.push("");
    lines.push([t("Показател"), t("Стойност")].map(q).join(","));
    lines.push([q(t("Общо ползи")), r2(result.totalBenefits)].join(","));
    lines.push([q(t("Общо разходи")), r2(result.totalCosts)].join(","));
    lines.push([q(t("Нетна полза")), r2(result.net)].join(","));
    lines.push([q("ROI %"), result.roi === null ? "" : r2(result.roi * 100)].join(","));
    lines.push([q("NPV"), r2(result.npv)].join(","));
    lines.push([q(t("Съотношение ползи/разходи")), result.bcr === null ? "" : r2(result.bcr)].join(","));
    lines.push([q("IRR %"), result.irr === null ? "" : r2(result.irr * 100)].join(","));
    lines.push([q(t("Откупуване (месеци)")), result.paybackMonths === null ? "" : r2(result.paybackMonths)].join(","));
    lines.push("");
    lines.push([t("Разход"), t("Тип"), t("Вид"), t("Сума"), t("Период"), t("Година"), t("Ръст %"), `${t("Общо за")} ${s.years} ${t("г. (коригирано)")}`].map(q).join(","));
    for (const e of expenses)
      lines.push([q(e.name), q(e.type), q(e.kind), e.amount, q(e.kind === "recurring" ? e.period : ""), e.year, e.growth, r2(result.expenseTotals[e.id] ?? 0)].join(","));
    lines.push("");
    lines.push([t("Полза"), t("Тип"), t("Твърда/мека"), t("Метод"), t("Годишна база"), t("Увереност %"), t("Начална година"), t("Ръст %"), `${t("Общо за")} ${s.years} ${t("г. (коригирано)")}`].map(q).join(","));
    for (const b of benefits)
      lines.push([q(b.name), q(b.type), q(b.nature), q(t(METHODS[b.method].label)), r2(METHODS[b.method].annual(b)), b.confidence, b.startYear, b.growth, r2(result.benefitTotals[b.id] ?? 0)].join(","));
    download("﻿" + lines.join("\n"), "text/csv;charset=utf-8", `${filename}.csv`);
  };
  const importJson = async (file: File) => {
    try {
      setModel(normalizeModel(JSON.parse(await file.text())));
      setNotice(t("Моделът е зареден"));
    } catch {
      setNotice(t("Този файл не е запазен ROI модел"));
    }
  };

  const years = Array.from({ length: s.years }, (_, i) => i + 1);

  return (
    <div>
      <PrintReport model={model} result={result} scenarios={scenarioResults} fmt={fmt} pct={pct} payback={payback} />
      <div className="print:hidden">
      {/* Toolbar */}
      <div className="print:hidden flex flex-wrap items-center gap-3 mb-8">
        <LangSwitch />
        <button onClick={exportCsv} className={`${btn} bg-fg text-bg hover:bg-white`}>
          {t("Изтегли CSV")}
        </button>
        <button onClick={() => window.print()} className={btnGhost}>
          {t("Запази като PDF")}
        </button>
        <button onClick={exportJson} className={btnGhost}>
          {t("Експорт JSON")}
        </button>
        <button onClick={() => fileRef.current?.click()} className={btnGhost}>
          {t("Импорт JSON")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => {
            if (confirm(t("Да се върне ли всичко към началния пример? Текущите данни ще бъдат изгубени."))) {
              setModel(exampleModel());
              setNotice(t("Върнато към началния пример"));
            }
          }}
          className={btnGhost}
        >
          {t("↺ Нулирай")}
        </button>
        <button
          onClick={() => {
            if (confirm(t("Да започнем ли с празен модел? Това не може да бъде отменено."))) {
              setModel(emptyModel());
              setNotice(t("Изчистено"));
            }
          }}
          className={`${btn} text-fg/60 hover:text-fg`}
        >
          {t("Изчисти")}
        </button>
        <span className="font-tech text-xs text-sage ml-auto" role="status" aria-live="polite">
          {notice || (loaded ? t("Автоматично запазено в този браузър") : "")}
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-6 items-start">
        {/* ---------------- Inputs ---------------- */}
        <div className="space-y-6 min-w-0">
          {/* Settings */}
          <section className={card} aria-labelledby="roi-settings">
            <h2 id="roi-settings" className={`${sectionTitle} mb-5`}>{t("1 · Допускания")}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field title={t("Име на инициативата")}>
                <input className={input} value={s.name} placeholder={t("напр. ИИ асистент за обработка на фактури")} onChange={(e) => setSettings({ name: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field title={t("Валута")}>
                  <select className={input} value={s.currency} onChange={(e) => setSettings({ currency: e.target.value })}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field title={t("Хоризонт")}>
                  <select className={input} value={s.years} onChange={(e) => setSettings({ years: Number(e.target.value) })}>
                    {Array.from({ length: MAX_YEARS }, (_, i) => i + 1).map((y) => (
                      <option key={y} value={y}>
                        {y} {y > 1 ? t("години") : t("година")}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field title={t("Дисконтов процент %")} hint={t("Вашата цена на капитала — попитайте финансовия отдел. Обичайно 8–12%.")}>
                <Num value={s.discountRate} min={0} onChange={(v) => setSettings({ discountRate: v })} />
              </Field>
              <Field title={t("Резерв за разходи %")} hint={t("Буфер върху всички разходи; ИИ проектите обикновено надвишават бюджета.")}>
                <Num value={s.contingency} min={0} onChange={(v) => setSettings({ contingency: v })} />
              </Field>
            </div>

            <div className="mt-6">
              <p className={label}>{t("Крива на внедряване — % от пълната полза, достигнат всяка година")}</p>
              <div className="grid grid-cols-5 gap-2 max-w-md">
                {years.map((y) => (
                  <label key={y} className="block">
                    <span className="block font-tech text-[11px] text-fg/45 mb-1">{t("Г")}{y}</span>
                    <Num
                      value={s.ramp[y - 1]}
                      min={0}
                      max={100}
                      ariaLabel={`${t("Внедряване през година")} ${y}`}
                      onChange={(v) => {
                        const ramp = [...s.ramp];
                        ramp[y - 1] = v;
                        setSettings({ ramp });
                      }}
                    />
                  </label>
                ))}
              </div>
              <p className="font-tech text-[11px] text-fg/40 mt-1">{t("Използването рядко е 100% от първия ден. Прилага се за ползите с отметка „крива на внедряване“.")}</p>
            </div>

            <div className="mt-6">
              <p className={label}>{t("Множители по сценарий — % върху ползите и разходите")}</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {SCENARIOS.map((sc) => (
                  <div key={sc.id} className="border border-line rounded-xl p-3">
                    <p className="font-tech text-sm text-fg mb-2">{t(sc.label)}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Field title={t("Ползи %")}>
                        <Num
                          value={s.scenarios[sc.id].benefits}
                          min={0}
                          onChange={(v) => setSettings({ scenarios: { ...s.scenarios, [sc.id]: { ...s.scenarios[sc.id], benefits: v } } })}
                        />
                      </Field>
                      <Field title={t("Разходи %")}>
                        <Num
                          value={s.scenarios[sc.id].costs}
                          min={0}
                          onChange={(v) => setSettings({ scenarios: { ...s.scenarios, [sc.id]: { ...s.scenarios[sc.id], costs: v } } })}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="mt-6 flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 accent-[#9DBFA8]" checked={s.includeSoft} onChange={(e) => setSettings({ includeSoft: e.target.checked })} />
              <span className="font-tech text-sm text-fg/80">
                {t("Включи меките ползи в основните резултати")}
                <span className="block text-xs text-fg/45">{t("Изключено по подразбиране: финансовите екипи обикновено оценяват по твърди, измерими ползи, а меките са допълнителен потенциал.")}</span>
              </span>
            </label>
          </section>

          {/* Expenses */}
          <section className={card} aria-labelledby="roi-costs">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 id="roi-costs" className={sectionTitle}>{t("2 · Разходи")}</h2>
              <span className="font-tech text-sm text-fg/70 tabular-nums">{fmt(result.totalCosts)} {t("общо")}</span>
            </div>
            {expenses.length === 0 && <p className="font-casual italic text-fg/55 mb-4">{t("Все още няма разходи. Добавете разработка, лицензи, изчисления, данни, хора и управление на промяната.")}</p>}
            <ul className="space-y-3">
              {expenses.map((e) => (
                <li key={e.id} className="border border-line rounded-xl p-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field title={t("Разход")}>
                      <input className={input} value={e.name} placeholder={t("напр. използване на LLM API")} onChange={(ev) => setExpense(e.id, { name: ev.target.value })} />
                    </Field>
                    <Field title={t("Тип")}>
                      <TypeSelect value={e.type} options={s.expenseTypes} onChange={(v) => setExpense(e.id, { type: v })} onAdd={addExpenseType} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <Field title={t("Вид")}>
                      <select
                        className={input}
                        value={e.kind}
                        onChange={(ev) => {
                          const kind = ev.target.value as Expense["kind"];
                          setExpense(e.id, { kind, year: kind === "one-time" ? 0 : Math.max(1, e.year) });
                        }}
                      >
                        <option value="one-time">{t("Еднократен")}</option>
                        <option value="recurring">{t("Периодичен")}</option>
                      </select>
                    </Field>
                    <Field title={e.kind === "recurring" ? (e.period === "month" ? t("Сума на месец") : t("Сума на година")) : t("Сума")}>
                      <Num value={e.amount} min={0} onChange={(v) => setExpense(e.id, { amount: v })} />
                    </Field>
                    {e.kind === "recurring" ? (
                      <>
                        <Field title={t("Плащане")}>
                          <select className={input} value={e.period} onChange={(ev) => setExpense(e.id, { period: ev.target.value as Expense["period"] })}>
                            <option value="month">{t("Месечно")}</option>
                            <option value="year">{t("Годишно")}</option>
                          </select>
                        </Field>
                        <Field title={t("Ръст % / год.")}>
                          <Num value={e.growth} onChange={(v) => setExpense(e.id, { growth: v })} />
                        </Field>
                      </>
                    ) : (
                      <div className="hidden sm:block col-span-2" />
                    )}
                    <Field title={e.kind === "recurring" ? t("Започва през") : t("Платен през")}>
                      <select className={input} value={e.year} onChange={(ev) => setExpense(e.id, { year: Number(ev.target.value) })}>
                        {e.kind === "one-time" && <option value={0}>{t("Старт (Г0)")}</option>}
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {t("Година")} {y}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-3">
                    <span className="font-tech text-xs text-fg/50 tabular-nums">
                      {fmt(result.expenseTotals[e.id] ?? 0)} {t("за")} {s.years} {t("г. вкл. резерв и сценарий")}
                    </span>
                    <span className="flex gap-1 print:hidden">
                      <button className="font-tech text-xs text-fg/50 hover:text-fg px-2 py-1" onClick={() => setModel((m) => ({ ...m, expenses: duplicate(m.expenses, e.id) }))}>
                        {t("Дублирай")}
                      </button>
                      <button className="font-tech text-xs text-fg/50 hover:text-[#E8875F] px-2 py-1" onClick={() => setModel((m) => ({ ...m, expenses: m.expenses.filter((x) => x.id !== e.id) }))}>
                        {t("Премахни")}
                      </button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <button className={`${btnGhost} mt-4 print:hidden`} onClick={() => setModel((m) => ({ ...m, expenses: [...m.expenses, newExpense(m.settings.expenseTypes[0])] }))}>
              {t("＋ Добави разход")}
            </button>
          </section>

          {/* Benefits */}
          <section className={card} aria-labelledby="roi-benefits">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 id="roi-benefits" className={sectionTitle}>{t("3 · Ползи")}</h2>
              <span className="font-tech text-sm text-fg/70 tabular-nums">{fmt(result.totalBenefits)} {t("общо")}</span>
            </div>
            {benefits.length === 0 && <p className="font-casual italic text-fg/55 mb-4">{t("Все още няма ползи. Започнете с времето, което хората ви печелят.")}</p>}
            <ul className="space-y-3">
              {benefits.map((b) => (
                <BenefitRow
                  key={b.id}
                  b={b}
                  s={s}
                  fmt={fmt}
                  total={result.benefitTotals[b.id] ?? 0}
                  onChange={(patch) => setBenefit(b.id, patch)}
                  onAddType={addBenefitType}
                  onDuplicate={() => setModel((m) => ({ ...m, benefits: duplicate(m.benefits, b.id) }))}
                  onRemove={() => setModel((m) => ({ ...m, benefits: m.benefits.filter((x) => x.id !== b.id) }))}
                />
              ))}
            </ul>
            <button className={`${btnGhost} mt-4 print:hidden`} onClick={() => setModel((m) => ({ ...m, benefits: [...m.benefits, newBenefit(m.settings.benefitTypes[0])] }))}>
              {t("＋ Добави полза")}
            </button>
          </section>

          {/* Types */}
          <section className={`${card} print:hidden`} aria-labelledby="roi-types">
            <h2 id="roi-types" className={`${sectionTitle} mb-4`}>{t("Категории")}</h2>
            <TypeList
              title={t("Типове разходи")}
              types={s.expenseTypes}
              used={new Set(expenses.map((e) => e.type))}
              onChange={(expenseTypes) => setSettings({ expenseTypes })}
            />
            <div className="h-5" />
            <TypeList
              title={t("Типове ползи")}
              types={s.benefitTypes}
              used={new Set(benefits.map((b) => b.type))}
              onChange={(benefitTypes) => setSettings({ benefitTypes })}
            />
          </section>
        </div>

        {/* ---------------- Results ---------------- */}
        <aside className="space-y-6 min-w-0 lg:sticky lg:top-20 print:static" aria-label={t("Резултати")}>
          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className={sectionTitle}>{t("Резултати")}</h2>
              <div className="inline-flex rounded-full border border-line p-0.5 print:hidden" role="tablist" aria-label={t("Сценарий")}>
                {SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    role="tab"
                    aria-selected={s.scenario === sc.id}
                    onClick={() => setSettings({ scenario: sc.id })}
                    className={`font-tech text-xs px-2.5 py-1 rounded-full transition-colors ${s.scenario === sc.id ? "bg-fg text-bg" : "text-fg/60 hover:text-fg"}`}
                  >
                    {t(sc.label)}
                  </button>
                ))}
              </div>
            </div>
            <p className="font-tech text-xs text-fg/50 mb-1">
              {t("Нетна полза за")} {s.years} {s.years > 1 ? t("години") : t("година")} · {t(SCENARIOS.find((x) => x.id === s.scenario)?.label ?? "").toLowerCase()}
            </p>
            <p className={`font-tech text-4xl font-bold tabular-nums mb-5 ${result.net >= 0 ? "text-fg" : "text-[#E8875F]"}`}>{fmt(result.net)}</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              <Stat term="ROI" value={pct(result.roi)} hint={t("(ползи − разходи) ÷ разходи")} />
              <Stat term={t("Откупуване")} value={payback(result.paybackMonths)} hint={t("когато кумулативното стане положително")} />
              <Stat term={`NPV @ ${s.discountRate}%`} value={fmt(result.npv)} hint={t("дисконтирана нетна стойност")} />
              <Stat term={t("IRR (вътрешна норма)")} value={pct(result.irr)} hint={t("дисконт, при който NPV = 0")} />
              <Stat term={t("Общо ползи")} value={fmt(result.totalBenefits)} />
              <Stat term={t("Общо разходи")} value={fmt(result.totalCosts)} />
              <Stat term={t("Ползи / разходи")} value={result.bcr === null ? "—" : `${result.bcr.toFixed(2)}×`} hint={t("PV ползи ÷ PV разходи")} />
              <Stat term={t("Меки ползи")} value={fmt(result.totalSoft)} hint={s.includeSoft ? t("включени горе") : t("не са в основните")} />
            </dl>
          </section>

          <section className={card}>
            <h2 className={`${sectionTitle} mb-4`}>{t("Паричен поток")}</h2>
            <CashFlowChart rows={result.rows} fmt={fmt} fmtShort={fmtShort} />
          </section>

          <section className={card}>
            <h2 className={`${sectionTitle} mb-3`}>{t("Сценарии")}</h2>
            <table className="w-full font-tech text-sm">
              <thead>
                <tr className="text-fg/50 text-xs">
                  <th className="text-left font-normal pb-2" />
                  <th className="text-right font-normal pb-2">ROI</th>
                  <th className="text-right font-normal pb-2">NPV</th>
                  <th className="text-right font-normal pb-2">{t("Откупуване")}</th>
                </tr>
              </thead>
              <tbody>
                {scenarioResults.map(({ id, label: sl, r }) => (
                  <tr key={id} className={`border-t border-line ${s.scenario === id ? "text-fg" : "text-fg/65"}`}>
                    <td className="py-2">{t(sl)}</td>
                    <td className="py-2 text-right tabular-nums">{pct(r.roi)}</td>
                    <td className="py-2 text-right tabular-nums">{fmtShort(r.npv)}</td>
                    <td className="py-2 text-right tabular-nums">{r.paybackMonths === null ? "—" : `${r.paybackMonths.toFixed(0)} ${t("мес.")}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="font-tech text-[11px] text-fg/40 mt-2">{t("Ако и песимистичният сценарий се изплаща, бизнес казусът е силен.")}</p>
          </section>
        </aside>
      </div>

      {/* ---------------- Detail ---------------- */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <section className={`${card} overflow-x-auto`}>
          <h2 className={`${sectionTitle} mb-4`}>{t("По години")}</h2>
          <table className="w-full font-tech text-sm min-w-[420px]">
            <thead>
              <tr className="text-fg/50 text-xs">
                <th className="text-left font-normal pb-2">{t("Година")}</th>
                <th className="text-right font-normal pb-2">{t("Ползи")}</th>
                <th className="text-right font-normal pb-2">{t("Разходи")}</th>
                <th className="text-right font-normal pb-2">{t("Нето")}</th>
                <th className="text-right font-normal pb-2">{t("Кумулативно")}</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr key={r.year} className="border-t border-line text-fg/85">
                  <td className="py-2">{r.year === 0 ? t("Старт") : `${t("Година")} ${r.year}`}</td>
                  <td className="py-2 text-right tabular-nums">{fmt(r.benefits)}</td>
                  <td className="py-2 text-right tabular-nums">{fmt(r.costs)}</td>
                  <td className="py-2 text-right tabular-nums">{fmt(r.net)}</td>
                  <td className={`py-2 text-right tabular-nums ${r.cumulative < 0 ? "text-[#E8875F]" : ""}`}>{fmt(r.cumulative)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-line text-fg font-semibold">
                <td className="py-2">{t("Общо")}</td>
                <td className="py-2 text-right tabular-nums">{fmt(result.totalBenefits)}</td>
                <td className="py-2 text-right tabular-nums">{fmt(result.totalCosts)}</td>
                <td className="py-2 text-right tabular-nums">{fmt(result.net)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </section>

        <section className={card}>
          <h2 className={`${sectionTitle} mb-4`}>{t("Къде отиват парите — и откъде идват")}</h2>
          <Breakdown title={t("Разходи по тип")} data={result.costsByType} color={COLOR_COST} fmt={fmt} />
          <div className="h-6" />
          <Breakdown title={t("Ползи по тип")} data={result.benefitsByType} color={COLOR_BENEFIT} fmt={fmt} />
        </section>
      </div>

      <Method />
      </div>
    </div>
  );
}

/* ---------- sub-components ---------- */

function Stat({ term, value, hint }: { term: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-tech text-xs text-fg/50">{term}</dt>
      <dd className="font-tech text-lg font-semibold text-fg tabular-nums truncate">{value}</dd>
      {hint && <dd className="font-tech text-[11px] text-fg/40">{hint}</dd>}
    </div>
  );
}

function BenefitRow({
  b,
  s,
  fmt,
  total,
  onChange,
  onAddType,
  onDuplicate,
  onRemove,
}: {
  b: Benefit;
  s: Settings;
  fmt: (n: number) => string;
  total: number;
  onChange: (patch: Partial<Benefit>) => void;
  onAddType: (t: string) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const { t } = useI18n();
  const method = METHODS[b.method];
  const annual = method.annual(b);
  const setInput = (k: string, v: number) => onChange({ inputs: { ...b.inputs, [k]: v } });

  return (
    <li className="border border-line rounded-xl p-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field title={t("Полза")}>
          <input className={input} value={b.name} placeholder={t("напр. по-бърза обработка на запитвания")} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <Field title={t("Тип")}>
            <TypeSelect value={b.type} options={s.benefitTypes} onChange={(v) => onChange({ type: v })} onAdd={onAddType} />
          </Field>
          <Field title={t("Твърда / мека")}>
            <select className={input} value={b.nature} onChange={(e) => onChange({ nature: e.target.value as Benefit["nature"] })}>
              <option value="hard">{t("Твърда")}</option>
              <option value="soft">{t("Мека")}</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="mt-3">
        <Field title={t("Как се изчислява?")}>
          <select className={input} value={b.method} onChange={(e) => onChange({ method: e.target.value as MethodId })}>
            {(Object.keys(METHODS) as MethodId[]).map((k) => (
              <option key={k} value={k}>
                {t(METHODS[k].label)}
              </option>
            ))}
          </select>
        </Field>
        <p className="font-tech text-[11px] text-fg/45 mt-1">{t(method.help)}</p>
      </div>

      {/* Method inputs */}
      <div className="mt-3 rounded-lg bg-bg/60 border border-line p-3">
        {b.method === "fixed" && (
          <div className="grid grid-cols-2 gap-3">
            <Field title={t("Сума")}>
              <Num value={b.inputs.amount ?? 0} onChange={(v) => setInput("amount", v)} />
            </Field>
            <Field title={t("На")}>
              <select className={input} value={b.inputs.perMonth ? "month" : "year"} onChange={(e) => setInput("perMonth", e.target.value === "month" ? 1 : 0)}>
                <option value="year">{t("Година")}</option>
                <option value="month">{t("Месец")}</option>
              </select>
            </Field>
          </div>
        )}
        {method.fields.length > 0 && b.method !== "fixed" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {method.fields.map((f) => (
              <Field key={f.key} title={t(f.label)}>
                <Num value={b.inputs[f.key] ?? 0} step={f.step} onChange={(v) => setInput(f.key, v)} />
              </Field>
            ))}
          </div>
        )}
        {b.method === "custom" && (
          <div>
            <ul className="space-y-2">
              {b.factors.map((f, i) => (
                <li key={f.id} className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,8rem)_auto] items-center gap-2">
                  <span className="font-tech text-xs text-fg/40 w-3">{i === 0 ? "" : "×"}</span>
                  <input
                    className={input}
                    value={f.label}
                    aria-label={t("Име на фактора")}
                    onChange={(e) => onChange({ factors: b.factors.map((x) => (x.id === f.id ? { ...x, label: e.target.value } : x)) })}
                  />
                  <Num
                    value={f.value}
                    ariaLabel={`${f.label} value`}
                    onChange={(v) => onChange({ factors: b.factors.map((x) => (x.id === f.id ? { ...x, value: v } : x)) })}
                  />
                  <button
                    className="font-tech text-xs text-fg/40 hover:text-fg px-1"
                    aria-label={`${t("Премахни")} ${f.label}`}
                    onClick={() => onChange({ factors: b.factors.filter((x) => x.id !== f.id) })}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button
                className="font-tech text-xs text-fg/70 hover:text-fg border border-line rounded-full px-3 py-1"
                onClick={() => onChange({ factors: [...b.factors, { id: uid(), label: `${t("Фактор")} ${t("АБВГДЕЖЗИЙКЛМНОП")[b.factors.length] ?? b.factors.length + 1}`, value: 1 }] })}
              >
                {t("＋ Фактор")}
              </button>
              <label className="font-tech text-xs text-fg/60 flex items-center gap-2">
                {t("Резултатът е на")}
                <select
                  className="bg-bg border border-line rounded-md px-2 py-1 text-fg"
                  value={b.customPeriod}
                  onChange={(e) => onChange({ customPeriod: e.target.value as Benefit["customPeriod"] })}
                >
                  <option value="year">{t("година")}</option>
                  <option value="month">{t("месец")}</option>
                </select>
              </label>
            </div>
          </div>
        )}
        <p className="font-tech text-xs text-fg/70 mt-3">
          {t("Базова стойност:")} <span className="text-fg font-semibold tabular-nums">{fmt(annual)}</span> {t("/ година при пълно внедряване")}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <Field title={t("Увереност %")} hint={t("Корекция за риск")}>
          <Num value={b.confidence} min={0} max={100} onChange={(v) => onChange({ confidence: v })} />
        </Field>
        <Field title={t("Започва през")}>
          <select className={input} value={b.startYear} onChange={(e) => onChange({ startYear: Number(e.target.value) })}>
            {Array.from({ length: s.years }, (_, i) => i + 1).map((y) => (
              <option key={y} value={y}>
                {t("Година")} {y}
              </option>
            ))}
          </select>
        </Field>
        <Field title={t("Ръст % / год.")}>
          <Num value={b.growth} onChange={(v) => onChange({ growth: v })} />
        </Field>
        <label className="flex items-center gap-2 font-tech text-sm text-fg/80 sm:pt-5 cursor-pointer">
          <input type="checkbox" className="accent-[#9DBFA8]" checked={b.applyRamp} onChange={(e) => onChange({ applyRamp: e.target.checked })} />
          {t("Приложи кривата на внедряване")}
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 mt-3">
        <span className="font-tech text-xs text-fg/50 tabular-nums">
          {fmt(total)} {t("за")} {s.years} {t("г. след корекции")}{b.nature === "soft" && !s.includeSoft ? t(" · мека, не е в основните") : ""}
        </span>
        <span className="flex gap-1 print:hidden">
          <button className="font-tech text-xs text-fg/50 hover:text-fg px-2 py-1" onClick={onDuplicate}>
            {t("Дублирай")}
          </button>
          <button className="font-tech text-xs text-fg/50 hover:text-[#E8875F] px-2 py-1" onClick={onRemove}>
            {t("Премахни")}
          </button>
        </span>
      </div>
    </li>
  );
}

function TypeList({ title, types, used, onChange }: { title: string; types: string[]; used: Set<string>; onChange: (types: string[]) => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState("");
  const add = () => {
    const name = draft.trim();
    if (name && !types.includes(name)) onChange([...types, name]);
    setDraft("");
  };
  return (
    <div>
      <p className={label}>{title}</p>
      <ul className="flex flex-wrap gap-2 mb-3">
        {types.map((ty) => (
          <li key={ty} className="inline-flex items-center gap-1 font-tech text-xs text-fg/80 border border-line rounded-full pl-3 pr-1 py-1">
            {ty}
            <button
              className="w-5 h-5 rounded-full text-fg/40 hover:text-fg disabled:opacity-30 disabled:hover:text-fg/40"
              aria-label={`${t("Премахни")} ${ty}`}
              title={used.has(ty) ? t("Използва се — първо сменете записите") : t("Премахни")}
              disabled={used.has(ty)}
              onClick={() => onChange(types.filter((x) => x !== ty))}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2 max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input className={input} value={draft} placeholder={t("Добави нов тип")} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit" className="font-tech text-sm text-fg border border-fg/30 rounded-lg px-3 hover:border-fg">
          {t("Добави")}
        </button>
      </form>
    </div>
  );
}

function Breakdown({ title, data, color, fmt }: { title: string; data: Record<string, number>; color: string; fmt: (n: number) => string }) {
  const { t } = useI18n();
  const entries = Object.entries(data)
    .filter(([, v]) => Math.abs(v) > 0.5)
    .sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => Math.abs(v)));
  const total = entries.reduce((a, [, v]) => a + v, 0);
  return (
    <div>
      <p className="font-tech text-xs text-fg/50 mb-3">{title}</p>
      {entries.length === 0 ? (
        <p className="font-tech text-sm text-fg/40">{t("Все още няма данни.")}</p>
      ) : (
        <ul className="space-y-2.5">
          {entries.map(([k, v]) => (
            <li key={k} title={`${k}: ${fmt(v)} (${total ? ((v / total) * 100).toFixed(0) : 0}%)`}>
              <div className="flex justify-between gap-3 font-tech text-xs mb-1">
                <span className="text-fg/80 truncate">{k}</span>
                <span className="text-fg tabular-nums shrink-0">
                  {fmt(v)} <span className="text-fg/40">· {total ? ((v / total) * 100).toFixed(0) : 0}%</span>
                </span>
              </div>
              <div className="h-2 rounded-r-full bg-line/40">
                <div className="h-2 rounded-r-full" style={{ width: `${(Math.abs(v) / max) * 100}%`, background: color }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Method() {
  const { lang } = useI18n();
  return lang === "en" ? <MethodEn /> : <MethodBg />;
}

function MethodBg() {
  const strong = "text-fg font-tech";
  return (
    <section className="mt-12 max-w-3xl print:hidden" aria-labelledby="roi-method">
      <h2 id="roi-method" className="font-tech text-2xl font-semibold text-fg mb-4">Как работи моделът</h2>
      <div className="font-casual text-fg/75 leading-relaxed space-y-4">
        <p>
          <strong className={strong}>Времева линия.</strong> „Старт“ (година 0) е моментът на инвестицията: разработка, почистване на данни,
          внедряване. От година 1 нататък са оперативните години. Еднократните разходи попадат в избраната година; периодичните текат от началната
          си година с незадължителен годишен ръст (напр. използването на API расте с внедряването).
        </p>
        <p>
          <strong className={strong}>Ползите се изграждат от двигатели,</strong> а не се гадаят като една сума: спестени минути × обем × хора ×
          пълна цена на час, допълнителни единици × стойност или очаквани инциденти × цена × намаление. За всичко друго използвайте собствени фактори.
        </p>
        <p>
          <strong className={strong}>След това се коригират надолу по три начина.</strong> <em>Крива на внедряване</em> (използването расте с
          времето), <em>увереностt(</em> за всяка полза (корекцията за риск от изследванията Total Economic Impact на Forrester) и избраният{") "}
          <em>сценарий</em>. Към разходите се добавя резерв. Меките ползи — като клиентско изживяване — се отчитат, но не влизат в основните
          резултати, освен ако не ги включите.
        </p>
        <p>
          <strong className={strong}>Резултати.</strong> ROI = (ползи − разходи) ÷ разходи. NPV дисконтира нетния поток на всяка година с вашия
          процент. IRR е процентът, при който NPV става нула. Откупуването е моментът, в който кумулативният поток стане положителен, като ползите се
          натрупват равномерно през годината.
        </p>
        <p className="text-sm text-fg/55">
          Подходът е базиран на методологията TEI на Forrester, отворената{" "}
          <a className="underline hover:text-fg" href="https://wyuneed.github.io/genai-roi-framework/" target="_blank" rel="noopener noreferrer">
            рамка GenAI ROI
          </a>{" "}
          и{" "}
          <a className="underline hover:text-fg" href="https://www.isaca.org/resources/news-and-trends/newsletters/atisaca/2025/volume-5/how-to-measure-and-prove-the-value-of-your-ai-investments" target="_blank" rel="noopener noreferrer">
            насоките на ISACA за измерване на стойността от ИИ
          </a>
          . Инструмент за планиране, а не финансов съвет — данните ви не напускат този браузър.
        </p>
      </div>
    </section>
  );
}

function MethodEn() {
  return (
    <section className="mt-12 max-w-3xl print:hidden" aria-labelledby="roi-method">
      <h2 id="roi-method" className="font-tech text-2xl font-semibold text-fg mb-4">How the model works</h2>
      <div className="font-casual text-fg/75 leading-relaxed space-y-4">
        <p>
          <strong className="text-fg font-tech">Timeline.</strong> “Start” (year 0) is the moment you invest: build, data clean-up, rollout.
          Years 1 onwards are operating years. One-time costs land in the year you choose; recurring costs run from their start year with an
          optional yearly growth rate (e.g. API usage growing with adoption).
        </p>
        <p>
          <strong className="text-fg font-tech">Benefits are built from drivers,</strong> not guessed as a lump sum: minutes saved × volume × people ×
          loaded hourly cost, extra units × value, or expected incidents × cost × reduction. Use custom factors for anything else.
        </p>
        <p>
          <strong className="text-fg font-tech">Then they’re adjusted down three ways.</strong> An <em>adoption ramp</em> (usage grows over time),
          a per-benefit <em>confidence</em> haircut (the risk adjustment used in Forrester’s Total Economic Impact studies), and the chosen{" "}
          <em>scenario</em>. Costs get a contingency buffer on top. Soft benefits — like customer experience — are tracked but kept out of the headline unless you opt in.
        </p>
        <p>
          <strong className="text-fg font-tech">Outputs.</strong> ROI = (benefits − costs) ÷ costs. NPV discounts each year’s net at your rate.
          IRR is the rate at which NPV hits zero. Payback is when cumulative cash turns positive, assuming benefits accrue evenly through each year.
        </p>
        <p className="text-sm text-fg/55">
          Approach informed by Forrester’s TEI methodology, the open{" "}
          <a className="underline hover:text-fg" href="https://wyuneed.github.io/genai-roi-framework/" target="_blank" rel="noopener noreferrer">
            GenAI ROI framework
          </a>
          , and{" "}
          <a className="underline hover:text-fg" href="https://www.isaca.org/resources/news-and-trends/newsletters/atisaca/2025/volume-5/how-to-measure-and-prove-the-value-of-your-ai-investments" target="_blank" rel="noopener noreferrer">
            ISACA’s guidance on measuring AI value
          </a>
          . A planning aid, not financial advice — your data never leaves this browser.
        </p>
      </div>
    </section>
  );
}

/* ---------- print-only report ---------- */

function PrintReport({
  model,
  result,
  scenarios,
  fmt,
  pct,
  payback,
}: {
  model: Model;
  result: Result;
  scenarios: { id: string; label: string; r: Result }[];
  fmt: (n: number) => string;
  pct: (n: number | null) => string;
  payback: (m: number | null) => string;
}) {
  const { t } = useI18n();
  const { settings: s, expenses, benefits } = model;
  const th = "text-left font-semibold py-1 pr-2 border-b border-black/30";
  const td = "py-1 pr-2 border-b border-black/10 align-top";
  const num = "text-right tabular-nums";
  const scenarioLabel = t(SCENARIOS.find((x) => x.id === s.scenario)?.label ?? "");
  return (
    <div className="hidden print:block bg-white text-[#16302B] font-tech text-[9pt] leading-snug">
      <h1 className="text-[18pt] font-bold">{s.name || t("ИИ инициатива")} — ROI</h1>
      <p className="text-black/60 mb-3">
        {t("Хоризонт")} {s.years} {t("г.")} · {t("сценарий")}: {scenarioLabel} · {t("дисконтов процент")} {s.discountRate}% · {t("резерв за разходи")} {s.contingency}% · {t("крива на внедряване")}{" "}
        {s.ramp.slice(0, s.years).map((r) => `${r}%`).join(" / ")} · {t("меки ползи")}: {s.includeSoft ? t("включени") : t("изключени")}
      </p>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          [t("Нетна полза"), fmt(result.net)],
          ["ROI", pct(result.roi)],
          [`NPV @ ${s.discountRate}%`, fmt(result.npv)],
          [t("Откупуване"), payback(result.paybackMonths)],
          [t("Общо ползи"), fmt(result.totalBenefits)],
          [t("Общо разходи"), fmt(result.totalCosts)],
          ["IRR", pct(result.irr)],
          [t("Ползи / разходи"), result.bcr === null ? "—" : `${result.bcr.toFixed(2)}×`],
        ].map(([k, v]) => (
          <div key={k} className="border border-black/20 rounded p-2">
            <p className="text-black/55 text-[8pt]">{k}</p>
            <p className="text-[12pt] font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <table className="w-full">
          <thead>
            <tr><th className={th}>{t("Година")}</th><th className={`${th} ${num}`}>{t("Ползи")}</th><th className={`${th} ${num}`}>{t("Разходи")}</th><th className={`${th} ${num}`}>{t("Нето")}</th><th className={`${th} ${num}`}>{t("Кумулативно")}</th></tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.year}>
                <td className={td}>{r.year === 0 ? t("Старт") : `${t("Година")} ${r.year}`}</td>
                <td className={`${td} ${num}`}>{fmt(r.benefits)}</td>
                <td className={`${td} ${num}`}>{fmt(r.costs)}</td>
                <td className={`${td} ${num}`}>{fmt(r.net)}</td>
                <td className={`${td} ${num}`}>{fmt(r.cumulative)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full">
          <thead>
            <tr><th className={th}>{t("Сценарий")}</th><th className={`${th} ${num}`}>ROI</th><th className={`${th} ${num}`}>NPV</th><th className={`${th} ${num}`}>{t("Откупуване")}</th></tr>
          </thead>
          <tbody>
            {scenarios.map(({ id, label: sl, r }) => (
              <tr key={id} className={id === s.scenario ? "font-semibold" : ""}>
                <td className={td}>{t(sl)}</td>
                <td className={`${td} ${num}`}>{pct(r.roi)}</td>
                <td className={`${td} ${num}`}>{fmt(r.npv)}</td>
                <td className={`${td} ${num}`}>{payback(r.paybackMonths)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-[11pt] font-semibold mb-1 break-after-avoid">{t("Разходи")}</h2>
      <table className="w-full mb-4">
        <thead>
          <tr><th className={th}>{t("Позиция")}</th><th className={th}>{t("Тип")}</th><th className={th}>{t("Основа")}</th><th className={`${th} ${num}`}>{t("Общо")} ({s.years} {t("г., коригирано")})</th></tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td className={td}>{e.name || "—"}</td>
              <td className={td}>{e.type}</td>
              <td className={td}>
                {e.kind === "one-time"
                  ? `${t("Еднократно")} ${fmt(e.amount)}, ${e.year === 0 ? t("старт") : `${t("година")} ${e.year}`}`
                  : `${fmt(e.amount)} / ${e.period === "month" ? t("месец") : t("година")} ${t("от година")} ${e.year}${e.growth ? `, +${e.growth}%/${t("год.")}` : ""}`}
              </td>
              <td className={`${td} ${num}`}>{fmt(result.expenseTotals[e.id] ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-[11pt] font-semibold mb-1 break-after-avoid">{t("Ползи")}</h2>
      <table className="w-full mb-4">
        <thead>
          <tr><th className={th}>{t("Позиция")}</th><th className={th}>{t("Тип")}</th><th className={th}>{t("Метод")}</th><th className={`${th} ${num}`}>{t("База / год.")}</th><th className={th}>{t("Корекции")}</th><th className={`${th} ${num}`}>{t("Общо")} ({s.years} {t("г., коригирано")})</th></tr>
        </thead>
        <tbody>
          {benefits.map((b) => (
            <tr key={b.id}>
              <td className={td}>{b.name || "—"}{b.nature === "soft" ? t(" (мека)") : ""}</td>
              <td className={td}>{b.type}</td>
              <td className={td}>
                {b.method === "custom"
                  ? b.factors.map((f) => `${f.label} ${f.value}`).join(" × ") + (b.customPeriod === "month" ? " × 12" : "")
                  : b.method === "fixed"
                    ? `${t("Фиксирано на")} ${b.inputs.perMonth ? t("месец") : t("година")}`
                    : METHODS[b.method].fields.map((f) => `${t(f.label).toLowerCase()} ${b.inputs[f.key] ?? 0}`).join(", ")}
              </td>
              <td className={`${td} ${num}`}>{fmt(METHODS[b.method].annual(b))}</td>
              <td className={td}>
                {t("увереност")} {b.confidence}%{b.applyRamp ? `, ${t("крива")}` : ""}, {t("от година")} {b.startYear}{b.growth ? `, +${b.growth}%/${t("год.")}` : ""}
              </td>
              <td className={`${td} ${num}`}>{fmt(result.benefitTotals[b.id] ?? 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-black/50 text-[7.5pt]">
        {t("ROI = (ползи − разходи) ÷ разходи. NPV дисконтира нетния паричен поток на всяка година; година 0 е първоначалната инвестиция. Ползите са коригирани за риск чрез увереност и крива на внедряване; разходите включват резерв. Създадено с ИИ ROI калкулатора на benliyski.com/projects/ai-roi.")}
      </p>
    </div>
  );
}
