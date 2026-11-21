/* AI ROI model: types, defaults and the calculation engine.
 *
 * Timeline: Year 0 is the up-front investment moment; Years 1..N are operating years.
 * Costs: one-time (lands in a chosen year) or recurring (per month / per year, from a start year, with growth).
 * Benefits: built from drivers (fixed, time saved, volume × value, risk avoided, custom factors),
 * then adjusted for adoption ramp, confidence (risk adjustment) and the selected scenario.
 */

export type ScenarioId = "pessimistic" | "realistic" | "optimistic";
export type Period = "month" | "year";
export type Nature = "hard" | "soft";
export type MethodId = "fixed" | "time" | "volume" | "risk" | "custom";

export type Expense = {
  id: string;
  name: string;
  type: string;
  kind: "one-time" | "recurring";
  amount: number;
  period: Period; // recurring only
  year: number; // one-time: the year it lands (0..N); recurring: start year (1..N)
  growth: number; // % per year, recurring only
};

export type Factor = { id: string; label: string; value: number };

export type Benefit = {
  id: string;
  name: string;
  type: string;
  nature: Nature;
  method: MethodId;
  inputs: Record<string, number>;
  factors: Factor[]; // custom method
  customPeriod: Period; // custom method: is the product per month or per year?
  startYear: number;
  growth: number; // % per year
  confidence: number; // % — risk adjustment
  applyRamp: boolean;
};

export type Settings = {
  name: string;
  currency: string;
  years: number;
  discountRate: number; // %
  contingency: number; // % added to all costs
  ramp: number[]; // adoption % for years 1..5
  includeSoft: boolean;
  scenario: ScenarioId;
  scenarios: Record<ScenarioId, { benefits: number; costs: number }>; // multipliers in %
  expenseTypes: string[];
  benefitTypes: string[];
};

export type Model = { settings: Settings; expenses: Expense[]; benefits: Benefit[] };

export const MAX_YEARS = 5;

export const SCENARIOS: { id: ScenarioId; label: string }[] = [
  { id: "pessimistic", label: "Песимистичен" },
  { id: "realistic", label: "Реалистичен" },
  { id: "optimistic", label: "Оптимистичен" },
];

export const CURRENCIES = ["EUR", "USD", "GBP", "BGN", "CHF"];

export const DEFAULT_EXPENSE_TYPES = [
  "Разработка и интеграция",
  "Лицензи и абонаменти",
  "Инфраструктура и изчисления",
  "Подготовка на данни",
  "Екип и обучение",
  "Управление на промяната",
  "Поддръжка и мониторинг",
  "Управление и съответствие",
];

export const DEFAULT_BENEFIT_TYPES = [
  "Спестено време / труд",
  "Намаляване на разходи",
  "Ръст на приходите",
  "Намаляване на риска",
  "Подобрено качество",
  "Клиентско изживяване",
  "Изживяване на служителите",
];

/** Driver-based benefit formulas. Each returns an ANNUAL value before adjustments. */
export const METHODS: Record<
  MethodId,
  {
    label: string;
    help: string;
    fields: { key: string; label: string; unit?: "money" | "%"; step?: number }[];
    annual: (b: Benefit) => number;
  }
> = {
  fixed: {
    label: "Фиксирана сума",
    help: "Известна икономия или печалба, напр. договор, който можете да прекратите.",
    fields: [{ key: "amount", label: "Сума", unit: "money" }],
    annual: (b) => (b.inputs.amount ?? 0) * (b.inputs.perMonth ? 12 : 1),
  },
  time: {
    label: "Спестено време",
    help: "Спестени минути на задача × задачи на човек месечно × хора × 12 × цена на час.",
    fields: [
      { key: "minutes", label: "Спестени минути на задача" },
      { key: "tasks", label: "Задачи на човек / месец" },
      { key: "people", label: "Засегнати хора" },
      { key: "rate", label: "Пълна цена на час", unit: "money" },
    ],
    annual: (b) =>
      ((b.inputs.minutes ?? 0) / 60) * (b.inputs.tasks ?? 0) * (b.inputs.people ?? 0) * 12 * (b.inputs.rate ?? 0),
  },
  volume: {
    label: "Обем × стойност",
    help: "Допълнителни единици годишно × стойност на единица, напр. допълнителни продажби × марж.",
    fields: [
      { key: "units", label: "Единици годишно" },
      { key: "value", label: "Стойност на единица", unit: "money" },
    ],
    annual: (b) => (b.inputs.units ?? 0) * (b.inputs.value ?? 0),
  },
  risk: {
    label: "Избегнат риск",
    help: "Очаквани инциденти годишно × цена на инцидент × % намаление благодарение на ИИ.",
    fields: [
      { key: "incidents", label: "Инциденти годишно", step: 0.1 },
      { key: "cost", label: "Цена на инцидент", unit: "money" },
      { key: "reduction", label: "Намаление", unit: "%" },
    ],
    annual: (b) => (b.inputs.incidents ?? 0) * (b.inputs.cost ?? 0) * ((b.inputs.reduction ?? 0) / 100),
  },
  custom: {
    label: "Собствени фактори",
    help: "Умножете произволни фактори. Добавяйте, преименувайте или премахвайте.",
    fields: [],
    annual: (b) => {
      if (!b.factors.length) return 0;
      const product = b.factors.reduce((p, f) => p * (Number.isFinite(f.value) ? f.value : 0), 1);
      return product * (b.customPeriod === "month" ? 12 : 1);
    },
  },
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export const newExpense = (type = DEFAULT_EXPENSE_TYPES[0]): Expense => ({
  id: uid(),
  name: "",
  type,
  kind: "recurring",
  amount: 0,
  period: "month",
  year: 1,
  growth: 0,
});

export const newBenefit = (type = DEFAULT_BENEFIT_TYPES[0]): Benefit => ({
  id: uid(),
  name: "",
  type,
  nature: "hard",
  method: "time",
  inputs: {},
  factors: [
    { id: uid(), label: "Фактор А", value: 0 },
    { id: uid(), label: "Фактор Б", value: 0 },
  ],
  customPeriod: "year",
  startYear: 1,
  growth: 0,
  confidence: 80,
  applyRamp: true,
});

export const defaultSettings = (): Settings => ({
  name: "",
  currency: "EUR",
  years: 3,
  discountRate: 10,
  contingency: 10,
  ramp: [40, 75, 90, 95, 95],
  includeSoft: false,
  scenario: "realistic",
  scenarios: {
    pessimistic: { benefits: 70, costs: 120 },
    realistic: { benefits: 100, costs: 100 },
    optimistic: { benefits: 120, costs: 95 },
  },
  expenseTypes: [...DEFAULT_EXPENSE_TYPES],
  benefitTypes: [...DEFAULT_BENEFIT_TYPES],
});

export const emptyModel = (): Model => ({ settings: defaultSettings(), expenses: [], benefits: [] });

/** A worked example: an AI assistant for a 25-person customer-support team. */
export const exampleModel = (): Model => {
  const s = defaultSettings();
  s.name = "ИИ асистент за клиентска поддръжка";
  const e = (p: Partial<Expense>): Expense => ({ ...newExpense(), ...p, id: uid() });
  const b = (p: Partial<Benefit>): Benefit => ({ ...newBenefit(), ...p, id: uid() });
  return {
    settings: s,
    expenses: [
      e({ name: "Разработка и интеграция с CRM", type: "Разработка и интеграция", kind: "one-time", amount: 60000, year: 0 }),
      e({ name: "Почистване на базата знания", type: "Подготовка на данни", kind: "one-time", amount: 15000, year: 0 }),
      e({ name: "Обучение и внедряване в екипа", type: "Управление на промяната", kind: "one-time", amount: 12000, year: 0 }),
      e({ name: "Използване на LLM API", type: "Инфраструктура и изчисления", kind: "recurring", amount: 1800, period: "month", year: 1, growth: 10 }),
      e({ name: "Лицензи за платформата", type: "Лицензи и абонаменти", kind: "recurring", amount: 9000, period: "year", year: 1 }),
      e({ name: "Мониторинг и поддръжка на промптове", type: "Поддръжка и мониторинг", kind: "recurring", amount: 1500, period: "month", year: 1 }),
    ],
    benefits: [
      b({
        name: "По-бърза обработка на запитвания",
        type: "Спестено време / труд",
        method: "time",
        inputs: { minutes: 5, tasks: 300, people: 25, rate: 32 },
        confidence: 80,
      }),
      b({
        name: "По-малко ескалации към второ ниво",
        type: "Намаляване на разходи",
        method: "volume",
        inputs: { units: 1800, value: 22 },
        confidence: 70,
      }),
      b({
        name: "По-малко нарушения на правилата в отговорите",
        type: "Намаляване на риска",
        method: "risk",
        inputs: { incidents: 4, cost: 8000, reduction: 40 },
        confidence: 60,
        applyRamp: false,
      }),
      b({
        name: "По-висока удовлетвореност → задържане на клиенти",
        type: "Клиентско изживяване",
        nature: "soft",
        method: "volume",
        inputs: { units: 30, value: 1200 },
        confidence: 50,
        startYear: 2,
      }),
    ],
  };
};

/* ---------- Calculation ---------- */

export type YearRow = { year: number; costs: number; benefits: number; soft: number; net: number; cumulative: number };

export type Result = {
  rows: YearRow[];
  totalCosts: number;
  totalBenefits: number; // hard (+ soft if included)
  totalSoft: number; // soft benefits (always computed, for reference)
  net: number;
  roi: number | null; // ratio
  npv: number;
  pvCosts: number;
  pvBenefits: number;
  bcr: number | null;
  irr: number | null;
  paybackMonths: number | null;
  costsByType: Record<string, number>;
  benefitsByType: Record<string, number>;
  expenseTotals: Record<string, number>;
  benefitTotals: Record<string, number>;
};

export function expenseInYear(e: Expense, y: number): number {
  if (e.kind === "one-time") return e.year === y ? e.amount : 0;
  const start = Math.max(1, e.year);
  if (y < start) return 0;
  const annual = e.amount * (e.period === "month" ? 12 : 1);
  return annual * Math.pow(1 + e.growth / 100, y - start);
}

export function benefitInYear(b: Benefit, y: number, s: Settings): number {
  const start = Math.max(1, b.startYear);
  if (y < 1 || y < start) return 0;
  const base = METHODS[b.method].annual(b);
  const ramp = b.applyRamp ? (s.ramp[y - 1] ?? 100) / 100 : 1;
  return base * Math.pow(1 + b.growth / 100, y - start) * ramp * (b.confidence / 100);
}

function npvAt(flows: number[], rate: number) {
  return flows.reduce((sum, f, i) => sum + f / Math.pow(1 + rate, i), 0);
}

function irr(flows: number[]): number | null {
  const hasNeg = flows.some((f) => f < 0);
  const hasPos = flows.some((f) => f > 0);
  if (!hasNeg || !hasPos) return null;
  let lo = -0.99;
  let hi = 10;
  let fLo = npvAt(flows, lo);
  if (fLo * npvAt(flows, hi) > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npvAt(flows, mid);
    if (Math.abs(fMid) < 1e-6) return mid;
    if (fLo * fMid < 0) hi = mid;
    else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

export function calculate(m: Model, scenario: ScenarioId = m.settings.scenario): Result {
  const s = m.settings;
  const N = Math.min(MAX_YEARS, Math.max(1, Math.round(s.years)));
  const mult = s.scenarios[scenario];
  const costMult = (1 + s.contingency / 100) * (mult.costs / 100);
  const benMult = mult.benefits / 100;

  const costsByType: Record<string, number> = {};
  const benefitsByType: Record<string, number> = {};
  const expenseTotals: Record<string, number> = {};
  const benefitTotals: Record<string, number> = {};
  const rows: YearRow[] = [];
  let cumulative = 0;

  for (let y = 0; y <= N; y++) {
    let costs = 0;
    for (const e of m.expenses) {
      const v = expenseInYear(e, y) * costMult;
      costs += v;
      costsByType[e.type] = (costsByType[e.type] ?? 0) + v;
      expenseTotals[e.id] = (expenseTotals[e.id] ?? 0) + v;
    }
    let hard = 0;
    let soft = 0;
    for (const b of m.benefits) {
      const v = benefitInYear(b, y, s) * benMult;
      if (b.nature === "soft") soft += v;
      else hard += v;
      if (b.nature === "hard" || s.includeSoft) benefitsByType[b.type] = (benefitsByType[b.type] ?? 0) + v;
      benefitTotals[b.id] = (benefitTotals[b.id] ?? 0) + v;
    }
    const benefits = hard + (s.includeSoft ? soft : 0);
    const net = benefits - costs;
    cumulative += net;
    rows.push({ year: y, costs, benefits, soft, net, cumulative });
  }

  const totalCosts = rows.reduce((a, r) => a + r.costs, 0);
  const totalBenefits = rows.reduce((a, r) => a + r.benefits, 0);
  const totalSoft = rows.reduce((a, r) => a + r.soft, 0);
  const r = s.discountRate / 100;
  const pvCosts = rows.reduce((a, row) => a + row.costs / Math.pow(1 + r, row.year), 0);
  const pvBenefits = rows.reduce((a, row) => a + row.benefits / Math.pow(1 + r, row.year), 0);

  // Payback: Year 0 is a point in time; operating years accrue evenly across 12 months.
  let paybackMonths: number | null = null;
  if (rows[0].cumulative >= 0 && totalCosts > 0) paybackMonths = 0;
  else {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].cumulative >= 0 && rows[i - 1].cumulative < 0 && rows[i].net > 0) {
        paybackMonths = 12 * (i - 1) + 12 * (-rows[i - 1].cumulative / rows[i].net);
        break;
      }
    }
  }

  return {
    rows,
    totalCosts,
    totalBenefits,
    totalSoft,
    net: totalBenefits - totalCosts,
    roi: totalCosts > 0 ? (totalBenefits - totalCosts) / totalCosts : null,
    npv: pvBenefits - pvCosts,
    pvCosts,
    pvBenefits,
    bcr: pvCosts > 0 ? pvBenefits / pvCosts : null,
    irr: irr(rows.map((row) => row.net)),
    paybackMonths,
    costsByType,
    benefitsByType,
    expenseTotals,
    benefitTotals,
  };
}

/** Merge a possibly-partial saved model over defaults so older files keep working. */
export function normalizeModel(raw: unknown): Model {
  const base = emptyModel();
  if (!raw || typeof raw !== "object") throw new Error("Not a model");
  const r = raw as Partial<Model>;
  if (!Array.isArray(r.expenses) || !Array.isArray(r.benefits)) throw new Error("Not a model");
  const settings = { ...base.settings, ...r.settings } as Settings;
  settings.scenarios = { ...base.settings.scenarios, ...(r.settings?.scenarios ?? {}) };
  const ramp = [...(settings.ramp ?? [])];
  while (ramp.length < MAX_YEARS) ramp.push(100);
  settings.ramp = ramp.slice(0, MAX_YEARS);
  return {
    settings,
    expenses: r.expenses.map((e) => ({ ...newExpense(), ...e, id: e.id || uid() })),
    benefits: r.benefits.map((b) => ({ ...newBenefit(), ...b, id: b.id || uid() })),
  };
}
