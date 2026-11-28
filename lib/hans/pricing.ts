/**
 * Deterministic price engine (TypeScript port of aluplast_demo/pricing.py – the Python version is the
 * reference; PARITY cases in generated.ts prove both give identical results). Integer cents, half-up rounding.
 */
import { PRICE_LIST, RULES } from "./generated";

export type WindowRequest = {
  window_type: string;
  glass: string;
  width_cm: number;
  height_cm: number;
  quantity?: number;
  remove_old?: boolean;
  sill?: boolean;
};

export type QuoteLine = { description: string; quantity: number; unit_price: string; total: string };

export type Quote = {
  lines: QuoteLine[];
  window_count: number;
  subtotal: string;
  discount_pct: number;
  discount_reason: string;
  discount_amount: string;
  total: string;
  range_low: string;
  range_high: string;
  earliest_delivery: string;
  currency: string;
  vat_included: boolean;
  notes: string[];
};

export class QuoteError extends Error {
  constructor(public problems: string[], public needsHuman = false) {
    super(problems.join("; "));
  }
}

type Item = (typeof PRICE_LIST)[number];
const ITEMS = new Map<string, Item>(PRICE_LIST.map((i) => [`${i.category}:${i.code}`, i]));
export const codes = (category: string) => PRICE_LIST.filter((i) => i.category === category).map((i) => i.code);
const get = (category: string, code: string) => ITEMS.get(`${category}:${code}`)!;

/** cents -> "955.08" (same as Python str(Decimal)) */
export const money = (c: number) => `${Math.trunc(c / 100)}.${String(Math.abs(c) % 100).padStart(2, "0")}`;
/** Python str() of a float: 1 -> "1.0" */
const pyNum = (x: number) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
/** half-up integer division for non-negative integers */
const div = (n: number, d: number) => Math.floor((n * 2 + d) / (2 * d));
/** Python's "{x:g}" for our cm values */
const g = (x: number) => String(Number(x.toFixed(6)));
const commaArea = (tenthsSq: number) => {
  const c = div(tenthsSq, 10_000); // (0.1 cm)^2 -> 0.01 m2
  return `${Math.trunc(c / 100)},${String(c % 100).padStart(2, "0")}`;
};

type Limits = { min_w: number; max_w: number; min_h: number; max_h: number };

function validate(w: WindowRequest): string[] {
  const p: string[] = [];
  if (!ITEMS.has(`window:${w.window_type}`)) p.push(`unknown window '${w.window_type}'; valid: ${codes("window").join(", ")}`);
  if (!ITEMS.has(`glass:${w.glass}`)) p.push(`unknown glass '${w.glass}'; valid: ${codes("glass").join(", ")}`);
  const q = w.quantity ?? 1;
  if (!(Number.isInteger(q) && q >= 1 && q <= RULES.max_quantity_per_line)) p.push(`quantity must be 1-${RULES.max_quantity_per_line}`);
  const all = RULES.size_limits_cm as Record<string, Limits>;
  const lim = all[w.window_type] ?? all.default;
  if (!(w.width_cm >= lim.min_w && w.width_cm <= lim.max_w))
    p.push(`${w.window_type} width ${w.width_cm} cm outside ${lim.min_w}-${lim.max_w} cm`);
  if (!(w.height_cm >= lim.min_h && w.height_cm <= lim.max_h))
    p.push(`${w.window_type} height ${w.height_cm} cm outside ${lim.min_h}-${lim.max_h} cm`);
  return p;
}

export function discountFor(windowCount: number, competitorOffer: boolean): [number, string] {
  if (windowCount >= RULES.discount_min_windows)
    return [RULES.discount_pct, `large order (${windowCount} windows > ${RULES.discount_min_windows - 1})`];
  if (competitorOffer) return [RULES.discount_pct, "customer reports a better offer elsewhere"];
  return [0, ""];
}

export function earliestDelivery(today: string): string {
  const d = new Date(`${today}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + RULES.min_delivery_days);
  return d.toISOString().slice(0, 10);
}

export function quote(windows: WindowRequest[], opts: { competitorOffer?: boolean; today: string }): Quote {
  if (!windows.length) throw new QuoteError(["no windows in the request"]);
  const problems = windows.flatMap((w, i) => validate(w).map((p) => `item ${i + 1}: ${p}`));
  if (problems.length) throw new QuoteError(problems, problems.some((p) => p.includes("outside")));

  const lines: { description: string; quantity: number; unit: number; total: number }[] = [];
  const notes: string[] = [];
  const minTenths = Math.round(RULES.min_chargeable_area_m2 * 1_000_000); // 1 m2 = 1e6 (0.1 cm)^2
  for (const w of windows) {
    const qty = w.quantity ?? 1;
    const wt = get("window", w.window_type), gl = get("glass", w.glass);
    const W = Math.round(w.width_cm * 10), H = Math.round(w.height_cm * 10);
    const area = W * H;
    const charged = Math.max(area, minTenths);
    if (charged > area) notes.push(`${wt.name_en} ${g(w.width_cm)}x${g(w.height_cm)} cm charged at minimum ${pyNum(RULES.min_chargeable_area_m2)} m2`);
    const unit = div(charged * (wt.cents + gl.cents), 1_000_000);
    lines.push({ description: `${wt.name_bg} / ${gl.name_bg}, ${g(w.width_cm)}×${g(w.height_cm)} см (${commaArea(area)} м²)`, quantity: qty, unit, total: unit * qty });
    if (w.remove_old) {
      const it = get("extra", "remove_old");
      const u = div(area * it.cents, 1_000_000);
      lines.push({ description: `${it.name_bg} (${g(w.width_cm)}×${g(w.height_cm)} см)`, quantity: qty, unit: u, total: u * qty });
    }
    if (w.sill) {
      const it = get("extra", "sill");
      const u = div(W * it.cents, 1000);
      lines.push({ description: `${it.name_bg} (${g(w.width_cm)} см)`, quantity: qty, unit: u, total: u * qty });
    }
  }
  const count = windows.reduce((s, w) => s + (w.quantity ?? 1), 0);
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const [pct, reason] = discountFor(count, !!opts.competitorOffer);
  const disc = div(subtotal * pct, 100);
  const total = subtotal - disc;
  const r = RULES.price_range_pct;
  notes.push(`Indicative price +/-${r}%; final price after on-site measurement. VAT included.`);
  return {
    lines: lines.map((l) => ({ description: l.description, quantity: l.quantity, unit_price: money(l.unit), total: money(l.total) })),
    window_count: count,
    subtotal: money(subtotal),
    discount_pct: pct,
    discount_reason: reason,
    discount_amount: money(disc),
    total: money(total),
    range_low: String(div(total * (100 - r), 10_000)),
    range_high: String(div(total * (100 + r), 10_000)),
    earliest_delivery: earliestDelivery(opts.today),
    currency: RULES.currency,
    vat_included: RULES.vat_included,
    notes,
  };
}

/** "1098" -> "1 098" */
export const whole = (n: number | string) => String(Math.trunc(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
/** "1098.5" -> "1 098,50 €" */
export const bgMoney = (s: string) => {
  const [i, d] = Number(s).toFixed(2).split(".");
  return `${whole(i)},${d} €`;
};
