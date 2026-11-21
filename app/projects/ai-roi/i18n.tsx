"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* Bulgarian is the source language: UI strings are written in Bulgarian and wrapped in t().
 * EN maps each Bulgarian string to English. A missing entry falls back to the Bulgarian text. */

export type Lang = "bg" | "en";
export const LANGS: { id: Lang; label: string; name: string }[] = [
  { id: "en", label: "EN", name: "English" },
  { id: "bg", label: "БГ", name: "Български" },
];

const EN: Record<string, string> = {
  // Page
  "Проекти · Инструмент": "Projects · Tool",
  "ИИ ROI калкулатор": "AI ROI Calculator",
  "← Всички проекти": "← All projects",
  "Изградете бизнес казуса за ИИ инициатива: опишете какво струва и какво връща, задайте колко бързо хората я възприемат и колко сте уверени — и вижте как ROI, NPV и откупуването се обновяват в реално време.":
    "Build the business case for an AI initiative: list what it costs and what it returns, set how fast people adopt it and how confident you are — and see ROI, NPV and payback update as you go.",
  Език: "Language",

  // Toolbar & notices
  "Изтегли CSV": "Download CSV",
  "Запази като PDF": "Save as PDF",
  "Експорт JSON": "Export JSON",
  "Импорт JSON": "Import JSON",
  "↺ Нулирай": "↺ Reset",
  Изчисти: "Clear",
  "Автоматично запазено в този браузър": "Autosaved in this browser",
  "Моделът е зареден": "Model loaded",
  "Този файл не е запазен ROI модел": "That file isn't a saved ROI model",
  "Да се върне ли всичко към началния пример? Текущите данни ще бъдат изгубени.":
    "Reset everything to the starting example? Your current inputs will be lost.",
  "Върнато към началния пример": "Reset to the starting example",
  "Да започнем ли с празен модел? Това не може да бъде отменено.": "Start from a blank model? This can't be undone.",
  Изчистено: "Cleared",

  // Assumptions
  "1 · Допускания": "1 · Assumptions",
  "Име на инициативата": "Initiative name",
  "напр. ИИ асистент за обработка на фактури": "e.g. Invoice-processing copilot",
  Валута: "Currency",
  Хоризонт: "Horizon",
  година: "year",
  години: "years",
  "Дисконтов процент %": "Discount rate %",
  "Вашата цена на капитала — попитайте финансовия отдел. Обичайно 8–12%.": "Your cost of capital — ask finance. 8–12% is common.",
  "Резерв за разходи %": "Cost contingency %",
  "Буфер върху всички разходи; ИИ проектите обикновено надвишават бюджета.": "Buffer on all costs; AI projects usually overrun.",
  "Крива на внедряване — % от пълната полза, достигнат всяка година": "Adoption ramp — % of full benefit reached each year",
  Г: "Y",
  "Внедряване през година": "Adoption in year",
  "Използването рядко е 100% от първия ден. Прилага се за ползите с отметка „крива на внедряване“.":
    "Usage rarely hits 100% on day one. Applied to benefits that have “ramp” ticked.",
  "Множители по сценарий — % върху ползите и разходите": "Scenario multipliers — % applied to benefits and costs",
  "Ползи %": "Benefits %",
  "Разходи %": "Costs %",
  "Включи меките ползи в основните резултати": "Include soft benefits in the headline numbers",
  "Изключено по подразбиране: финансовите екипи обикновено оценяват по твърди, измерими ползи, а меките са допълнителен потенциал.":
    "Off by default: finance teams usually judge on hard, measurable benefits and treat soft ones as upside.",

  // Costs
  "2 · Разходи": "2 · Costs",
  общо: "total",
  "Все още няма разходи. Добавете разработка, лицензи, изчисления, данни, хора и управление на промяната.":
    "No costs yet. Add build, licences, compute, data, people and change management.",
  Разход: "Expense",
  "напр. използване на LLM API": "e.g. LLM API usage",
  Тип: "Type",
  Вид: "Kind",
  Еднократен: "One-time",
  Периодичен: "Recurring",
  "Сума на месец": "Amount per month",
  "Сума на година": "Amount per year",
  Сума: "Amount",
  Плащане: "Billed",
  Месечно: "Monthly",
  Годишно: "Yearly",
  "Ръст % / год.": "Growth % / yr",
  "Започва през": "Starts in",
  "Платен през": "Paid in",
  "Старт (Г0)": "Start (Y0)",
  Година: "Year",
  за: "over",
  "г. вкл. резерв и сценарий": "yr incl. contingency & scenario",
  Дублирай: "Duplicate",
  Премахни: "Remove",
  "＋ Добави разход": "＋ Add cost",
  "(копие)": "(copy)",

  // Benefits
  "3 · Ползи": "3 · Benefits",
  "Все още няма ползи. Започнете с времето, което хората ви печелят.": "No benefits yet. Start with the time your people get back.",
  "＋ Добави полза": "＋ Add benefit",
  Полза: "Benefit",
  "напр. по-бърза обработка на запитвания": "e.g. Faster ticket handling",
  "Твърда / мека": "Hard / soft",
  Твърда: "Hard",
  Мека: "Soft",
  "Как се изчислява?": "How is it calculated?",
  На: "Per",
  Месец: "Month",
  "Име на фактора": "Factor name",
  "＋ Фактор": "＋ Factor",
  "Резултатът е на": "Result is per",
  месец: "month",
  "Базова стойност:": "Base value:",
  "/ година при пълно внедряване": "/ year at full adoption",
  "Увереност %": "Confidence %",
  "Корекция за риск": "Risk adjustment",
  "Приложи кривата на внедряване": "Apply adoption ramp",
  "г. след корекции": "yr after adjustments",
  " · мека, не е в основните": " · soft, not in headline",
  АБВГДЕЖЗИЙКЛМНОП: "ABCDEFGHIJKLMNOP",
  Фактор: "Factor",

  // Categories
  Категории: "Categories",
  "Типове разходи": "Cost types",
  "Типове ползи": "Benefit types",
  "Използва се — първо сменете записите": "In use — change the items first",
  "Добави нов тип": "Add a new type",
  Добави: "Add",
  "Име на новия тип": "Name of the new type",
  "＋ Нов тип…": "＋ New type…",

  // Results
  Резултати: "Results",
  Сценарий: "Scenario",
  "Нетна полза за": "Net benefit over",
  "(ползи − разходи) ÷ разходи": "(benefits − costs) ÷ costs",
  Откупуване: "Payback",
  "когато кумулативното стане положително": "when cumulative turns positive",
  "дисконтирана нетна стойност": "discounted net value",
  "IRR (вътрешна норма)": "IRR",
  "дисконт, при който NPV = 0": "break-even discount rate",
  "Общо ползи": "Total benefits",
  "Общо разходи": "Total costs",
  "Ползи / разходи": "Benefit-cost ratio",
  "PV ползи ÷ PV разходи": "PV benefits ÷ PV costs",
  "Меки ползи": "Soft benefits",
  "включени горе": "included above",
  "не са в основните": "not in headline",
  "Паричен поток": "Cash flow",
  Сценарии: "Scenarios",
  "мес.": "mo",
  "Ако и песимистичният сценарий се изплаща, бизнес казусът е силен.": "If the pessimistic case still pays back, the case is strong.",
  "По години": "Year by year",
  Ползи: "Benefits",
  Разходи: "Costs",
  Нето: "Net",
  Кумулативно: "Cumulative",
  Общо: "Total",
  Старт: "Start",
  "Къде отиват парите — и откъде идват": "Where the money goes — and comes from",
  "Разходи по тип": "Costs by type",
  "Ползи по тип": "Benefits by type",
  "Все още няма данни.": "Nothing yet.",
  Веднага: "Immediate",
  месеца: "months",
  "Не в рамките на": "Not within",
  "г.": "yr",

  // CSV & print report
  "ROI на ИИ инициатива": "AI initiative ROI",
  "ИИ инициатива": "AI initiative",
  Показател: "Metric",
  Стойност: "Value",
  "Нетна полза": "Net benefit",
  "Съотношение ползи/разходи": "Benefit-cost ratio",
  "Откупуване (месеци)": "Payback months",
  "Меки ползи (справочно)": "Soft benefits (memo)",
  Период: "Period",
  "Ръст %": "Growth %",
  "Твърда/мека": "Hard/soft",
  Метод: "Method",
  "Годишна база": "Annual base",
  "Начална година": "Start year",
  "Общо за": "Total over",
  "г. (коригирано)": "yr (adjusted)",
  "сценарий": "scenario",
  "дисконтов процент": "discount rate",
  "резерв за разходи": "cost contingency",
  "крива на внедряване": "adoption ramp",
  "меки ползи": "soft benefits",
  включени: "included",
  изключени: "excluded",
  Позиция: "Item",
  Основа: "Basis",
  "г., коригирано": "yr, adjusted",
  Еднократно: "One-time",
  старт: "start",
  "от година": "from year",
  "год.": "yr",
  "База / год.": "Base / yr",
  Корекции: "Adjustments",
  " (мека)": " (soft)",
  "Фиксирано на": "Fixed per",
  увереност: "confidence",
  крива: "ramp",
  "ROI = (ползи − разходи) ÷ разходи. NPV дисконтира нетния паричен поток на всяка година; година 0 е първоначалната инвестиция. Ползите са коригирани за риск чрез увереност и крива на внедряване; разходите включват резерв. Създадено с ИИ ROI калкулатора на benliyski.com/projects/ai-roi.":
    "ROI = (benefits − costs) ÷ costs. NPV discounts each year's net cash flow; year 0 is the up-front investment. Benefits are risk-adjusted by confidence and adoption ramp; costs include contingency. Made with the AI ROI Calculator at benliyski.com/projects/ai-roi.",

  // Chart
  "Нетен паричен поток и кумулативна позиция по години": "Net cash flow and cumulative position by year",
  "Старт (година 0)": "Start (Year 0)",
  "Нетна печалба за годината": "Net gain in year",
  "Нетен разход за годината": "Net spend in year",
  "Кумулативна позиция": "Cumulative position",

  // Model: scenarios, methods, fields
  Песимистичен: "Pessimistic",
  Реалистичен: "Realistic",
  Оптимистичен: "Optimistic",
  "Фиксирана сума": "Fixed amount",
  "Известна икономия или печалба, напр. договор, който можете да прекратите.": "A known saving or gain, e.g. a contract you can cancel.",
  "Спестено време": "Time saved",
  "Спестени минути на задача × задачи на човек месечно × хора × 12 × цена на час.":
    "Minutes saved per task × tasks per person per month × people × 12 × hourly cost.",
  "Спестени минути на задача": "Minutes saved per task",
  "Задачи на човек / месец": "Tasks per person / month",
  "Засегнати хора": "People affected",
  "Пълна цена на час": "Loaded hourly cost",
  "Обем × стойност": "Volume × value",
  "Допълнителни единици годишно × стойност на единица, напр. допълнителни продажби × марж.":
    "Extra units per year × value per unit, e.g. extra conversions × margin.",
  "Единици годишно": "Units per year",
  "Стойност на единица": "Value per unit",
  "Избегнат риск": "Risk avoided",
  "Очаквани инциденти годишно × цена на инцидент × % намаление благодарение на ИИ.":
    "Expected incidents per year × cost per incident × % reduction thanks to AI.",
  "Инциденти годишно": "Incidents per year",
  "Цена на инцидент": "Cost per incident",
  Намаление: "Reduction",
  "Собствени фактори": "Custom factors",
  "Умножете произволни фактори. Добавяйте, преименувайте или премахвайте.": "Multiply any factors you like. Add, rename or remove them.",

  // Model: default data (translated on language switch while untouched)
  "Фактор А": "Factor A",
  "Фактор Б": "Factor B",
  "Разработка и интеграция": "Development & integration",
  "Лицензи и абонаменти": "Licences & subscriptions",
  "Инфраструктура и изчисления": "Infrastructure & compute",
  "Подготовка на данни": "Data preparation",
  "Екип и обучение": "Talent & training",
  "Управление на промяната": "Change management",
  "Поддръжка и мониторинг": "Maintenance & monitoring",
  "Управление и съответствие": "Governance & compliance",
  "Спестено време / труд": "Labour / time savings",
  "Намаляване на разходи": "Cost reduction",
  "Ръст на приходите": "Revenue uplift",
  "Намаляване на риска": "Risk reduction",
  "Подобрено качество": "Quality improvement",
  "Клиентско изживяване": "Customer experience",
  "Изживяване на служителите": "Employee experience",
  "ИИ асистент за клиентска поддръжка": "Customer-support AI assistant",
  "Разработка и интеграция с CRM": "Build & CRM integration",
  "Почистване на базата знания": "Knowledge-base clean-up",
  "Обучение и внедряване в екипа": "Team training & rollout",
  "Използване на LLM API": "LLM API usage",
  "Лицензи за платформата": "Platform seats",
  "Мониторинг и поддръжка на промптове": "Monitoring & prompt upkeep",
  "По-бърза обработка на запитвания": "Faster ticket handling",
  "По-малко ескалации към второ ниво": "Fewer escalations to tier 2",
  "По-малко нарушения на правилата в отговорите": "Fewer compliance slips in replies",
  "По-висока удовлетвореност → задържане на клиенти": "Higher CSAT → retention",
};

const BG: Record<string, string> = Object.fromEntries(Object.entries(EN).map(([bg, en]) => [en, bg]));

/** Translate a known string (in either language) into `lang`; unknown strings (user input) pass through. */
export function translateText(text: string, lang: Lang): string {
  if (lang === "en") return EN[text] ?? text;
  return BG[text] ?? text;
}

export const translate = (lang: Lang) => (bg: string) => (lang === "en" ? (EN[bg] ?? bg) : bg);

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (bg: string) => string };
const I18n = createContext<Ctx>({ lang: "bg", setLang: () => {}, t: (s) => s });

const LANG_KEY = "ai-roi:lang";

export function LangProvider({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const [lang, setLangState] = useState<Lang>("bg");

  useEffect(() => {
    let next: Lang | null = null;
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "bg") next = saved;
    } catch {
      /* storage unavailable */
    }
    if (!next) next = navigator.language?.toLowerCase().startsWith("bg") ? "bg" : "en";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of saved preference / browser language
    if (next !== "bg") setLangState(next);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: translate(lang) }), [lang, setLang]);
  return (
    <I18n.Provider value={value}>
      <div lang={lang} className={className} style={style}>
        {children}
      </div>
    </I18n.Provider>
  );
}

export const useI18n = () => useContext(I18n);

/** EN / БГ switch. */
export function LangSwitch({ onChange }: { onChange?: (from: Lang, to: Lang) => void }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="inline-flex rounded-full border border-line p-0.5" role="group" aria-label={t("Език")}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          title={l.name}
          aria-pressed={lang === l.id}
          onClick={() => {
            if (l.id === lang) return;
            onChange?.(lang, l.id);
            setLang(l.id);
          }}
          className={`font-tech text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            lang === l.id ? "bg-fg text-bg" : "text-fg/60 hover:text-fg"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
