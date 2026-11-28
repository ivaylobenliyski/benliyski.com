/**
 * Deterministic policy checker (port of aluplast_demo/checker.py): every reply is checked before the customer
 * sees it. Regexes are built with `new RegExp(..., "u")` so Cyrillic word boundaries work.
 */
import { PRICE_LIST } from "./generated";
import type { Quote } from "./pricing";

const N = String.raw`\d[\d  .,]*\d|\d`;
const MONEY = new RegExp(
  String.raw`(?:€\s?(${N})(?:\s*[–-]\s*€?\s?(${N}))?)|(?:(${N})(?:\s*[–-]\s*(${N}))?\s*(?:€|евро|eur(?![\p{L}])|euro))`,
  "giu",
);
const PERCENT = /(\d+(?:[.,]\d+)?)\s*%/g;
const WEEKS = /(\d+)\s*(?:седмиц|week)/giu;
const DAYS = /(\d+)\s*(?:дни|дена|days)/giu;
const DELIVERY_CTX = /достав|монтаж|изработ|готов|deliver|install|ready/iu;
const SENT_CLAIM = /изпратих|изпратихме|has been sent|was sent|i sent|i've sent|i have sent/iu;
const BOOKED_CLAIM = /запазих|записах|резервирах|запазен час|i booked|i've booked|is booked|has been booked/iu;
const ALLOWED_PCT = new Set([5, 15, 20, 50]);
export const MAX_WORDS = 120;

export function parseNumber(raw: string): number | null {
  let s = raw.replace(/ /g, " ").trim().replace(/ /g, "");
  if (s.includes(",") && s.includes(".")) {
    const dec = s.lastIndexOf(",") > s.lastIndexOf(".") ? "," : ".";
    s = s.split(dec === "," ? "." : ",").join("").replace(dec, ".");
  } else if (s.includes(",")) {
    s = /,\d{1,2}$/.test(s) ? s.replace(",", ".") : s.split(",").join("");
  } else if (s.includes(".") && !/\.\d{1,2}$/.test(s)) {
    s = s.split(".").join("");
  }
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

export type CheckState = { quotes: Quote[]; emailsSent: unknown[]; appointments: unknown[] };

function allowedAmounts(st: CheckState): number[] {
  const vals = PRICE_LIST.map((i) => i.cents / 100);
  for (const q of st.quotes) {
    vals.push(...[q.total, q.subtotal, q.discount_amount, q.range_low, q.range_high].map(Number));
    for (const l of q.lines) vals.push(Number(l.unit_price), Number(l.total));
  }
  return vals;
}

const okAmount = (v: number, allowed: number[]) =>
  allowed.some((a) => Math.abs(v - a) < 0.01 || v === Math.round(a) || v === Math.trunc(a));

export function checkReply(text: string, st: CheckState): string[] {
  const problems: string[] = [];
  const allowed = allowedAmounts(st);
  for (const m of text.matchAll(MONEY)) {
    for (const g of m.slice(1)) {
      if (g === undefined) continue;
      const v = parseNumber(g);
      if (v !== null && !okAmount(v, allowed))
        problems.push(`amount ${g.trim()} € did not come from the price engine (call quote_price, use its numbers)`);
    }
  }
  for (const m of text.matchAll(PERCENT)) {
    const v = parseNumber(m[1]);
    if (v !== null && !ALLOWED_PCT.has(v)) problems.push(`${m[0]} is not an allowed figure (discount is max 5%, price range ±15%)`);
  }
  for (const m of text.matchAll(WEEKS)) if (Number(m[1]) < 3) problems.push(`'${m[0]}': delivery is never sooner than 3 weeks`);
  for (const m of text.matchAll(DAYS)) {
    const i = m.index ?? 0;
    const around = text.slice(Math.max(0, i - 60), i + m[0].length + 60);
    const after = text.slice(i, i + m[0].length + 12);
    if (Number(m[1]) < 21 && DELIVERY_CTX.test(around) && !/работн|working/iu.test(after))
      problems.push(`'${m[0]}' near delivery/installation: minimum is 3 weeks`);
  }
  if (SENT_CLAIM.test(text) && !st.emailsSent.length) problems.push("you claim an e-mail was sent, but send_offer_email has not succeeded");
  if (BOOKED_CLAIM.test(text) && !st.appointments.length) problems.push("you claim an appointment was booked, but book_appointment has not succeeded");
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words > MAX_WORDS) problems.push(`reply has ${words} words; keep it under ${MAX_WORDS} (max 3 short sentences or a short list)`);
  return problems;
}
