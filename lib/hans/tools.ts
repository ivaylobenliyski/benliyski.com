/** Hans's tools (port of aluplast_demo/session.py). Errors are returned to the model as is_error results. */
import type Anthropic from "@anthropic-ai/sdk";
import { bgMoney, codes, quote, QuoteError, whole, type Quote, type WindowRequest } from "./pricing";
import { freeSlots } from "./slots";
import type { Appointment, HansState } from "./state";

export class ToolError extends Error {}

/** Storage the tools need beyond the chat state (appointments are shared across chats). */
export type ToolEnv = {
  chatId: string;
  takenSlots: (kind: string) => Promise<Set<string>>;
  bookSlot: (a: Appointment) => Promise<boolean>; // false if the slot was taken meanwhile
};

const L = String.raw`[\p{L}\p{N}]`;
const AFFIRMATIVE = new RegExp(
  `(?<!${L})(да|давай|добре|ок|окей|изпрати|изпратете|потвърждавам|съгласен|съгласна|yes|ok|okay|sure|send|confirm)(?!${L})`,
  "iu",
);
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
const PHONE_RE = /^(\+359|0)\d{8,9}$/;
const cleanPhone = (p: unknown) => String(p ?? "").replace(/[\s\-/()]/g, "");
const now = () => new Date().toISOString().slice(0, 19);

function renderOffer(name: string, q: Quote): string {
  const lines = q.lines.map((l) => `  - ${l.description}: ${l.quantity} бр. × ${bgMoney(l.unit_price)} = ${bgMoney(l.total)}`).join("\n");
  const disc = q.discount_pct ? `\nОтстъпка ${q.discount_pct}%: -${bgMoney(q.discount_amount)}` : "";
  const d = q.earliest_delivery.split("-").reverse().join(".");
  return (
    `Здравейте${name ? ", " + name : ""},\n\nБлагодарим Ви за запитването. Ето Вашата ориентировъчна оферта:\n\n${lines}\n\n` +
    `Междинна сума: ${bgMoney(q.subtotal)}${disc}\nОбща сума: ${bgMoney(q.total)} (с ДДС и монтаж)\n` +
    `Ориентировъчен диапазон (±15%): ${bgMoney(q.range_low)} – ${bgMoney(q.range_high)}\n` +
    `Най-ранна доставка и монтаж: след ${d} (минимум 3 седмици).\n\n` +
    "Цената е ориентировъчна. Окончателната цена се потвърждава с писмена оферта след безплатен оглед и замерване. " +
    "Писмената оферта е валидна 30 дни.\n\nПоздрави,\nХанс – виртуален асистент (AI) на AluPlast Demo\n" +
    "Тел.: +359 2 012 3456 · oferti@aluplast-demo.example\n\nТова е демонстрация за университетски проект. AluPlast Demo е измислена фирма."
  );
}

const obj = (properties: Record<string, unknown>, required: string[]) => ({ type: "object" as const, properties, required });
const kind = { type: "string", enum: ["call", "consultation"] };
const item = obj(
  {
    window_type: { type: "string", enum: codes("window") },
    glass: { type: "string", enum: codes("glass") },
    width_cm: { type: "number" },
    height_cm: { type: "number" },
    quantity: { type: "integer", minimum: 1 },
    remove_old: { type: "boolean", description: "remove and dispose of old windows" },
    sill: { type: "boolean", description: "interior PVC window sill" },
  },
  ["window_type", "glass", "width_cm", "height_cm"],
);

export const TOOLS: Anthropic.Beta.BetaTool[] = [
  { name: "quote_price", description: "Calculate the indicative price for the customer's windows from the official price list. ALWAYS use this for any price, discount or delivery date; never calculate yourself. Set competitor_offer=true only if the customer said they have a cheaper offer elsewhere.",
    input_schema: obj({ items: { type: "array", items: item }, competitor_offer: { type: "boolean" } }, ["items"]) },
  { name: "preview_offer_email", description: "Prepare (NOT send) the offer e-mail for the latest quote. Use when the customer wants the offer by e-mail. Then ask the customer to confirm.",
    input_schema: obj({ email: { type: "string" }, customer_name: { type: "string" } }, ["email"]) },
  { name: "send_offer_email", description: "Send the previewed offer e-mail. Only after the customer explicitly confirmed in their latest message.",
    input_schema: obj({}, []) },
  { name: "available_slots", description: "Free time slots for a phone call or an on-site consultation (measurement visit).",
    input_schema: obj({ kind }, ["kind"]) },
  { name: "book_appointment", description: "Book a call or consultation slot the customer chose.",
    input_schema: obj({ kind, slot: { type: "string", description: "exactly as returned, YYYY-MM-DD HH:MM" }, name: { type: "string" }, phone: { type: "string" }, address: { type: "string", description: "required for consultation" } }, ["kind", "slot", "name", "phone"]) },
  { name: "save_contact", description: "Save contact details the customer gave (name, phone, e-mail).",
    input_schema: obj({ name: { type: "string" }, phone: { type: "string" }, email: { type: "string" } }, []) },
  { name: "handoff_to_human", description: "Pass the conversation to the sales team: sizes outside the catalogue, colours/shutters/other products, discount >5%, delivery <3 weeks, complaints, binding offers, or the customer asks for a human.",
    input_schema: obj({ reason: { type: "string" }, summary: { type: "string" } }, ["reason", "summary"]) },
];

type Args = Record<string, unknown>;

export async function runTool(name: string, a: Args, s: HansState, env: ToolEnv): Promise<string> {
  switch (name) {
    case "quote_price": {
      const items = (Array.isArray(a.items) ? a.items : []) as Args[];
      const reqs: WindowRequest[] = items.map((i) => {
        if (i.window_type == null || i.glass == null || i.width_cm == null || i.height_cm == null)
          throw new ToolError("each item needs window_type, glass, width_cm, height_cm (and optional quantity, remove_old, sill)");
        return { window_type: String(i.window_type), glass: String(i.glass), width_cm: Number(i.width_cm), height_cm: Number(i.height_cm),
          quantity: i.quantity == null ? 1 : Number(i.quantity), remove_old: !!i.remove_old, sill: !!i.sill };
      });
      let q: Quote;
      try {
        q = quote(reqs, { competitorOffer: !!a.competitor_offer, today: s.today });
      } catch (e) {
        if (e instanceof QuoteError)
          throw new ToolError(e.problems.join("; ") + (e.needsHuman ? " These items are outside the catalogue: call handoff_to_human." : " Ask the customer for the correct value."));
        throw e;
      }
      s.quotes.push(q);
      s.lastItems = items;
      return JSON.stringify({ ...q,
        display: { range: `${whole(q.range_low)} – ${whole(q.range_high)} €`, total: bgMoney(q.total), discount: bgMoney(q.discount_amount),
          earliest_delivery: q.earliest_delivery.split("-").reverse().join(".") },
        instructions: "Show the customer ONLY these numbers: the range (display.range), optionally total and discount. Say it is indicative, incl. VAT and installation, final after the free visit. Then offer: e-mail the offer, a phone call, or a consultation." });
    }
    case "preview_offer_email": {
      if (!s.quotes.length) throw new ToolError("no offer yet: call quote_price first");
      const to = String(a.email ?? "").trim();
      if (!EMAIL_RE.test(to)) throw new ToolError(`'${to}' is not a valid e-mail address; ask the customer again`);
      const nm = String(a.customer_name ?? "").trim();
      const body = renderOffer(nm, s.quotes[s.quotes.length - 1]);
      s.pendingEmail = { to, name: nm, body, quoteIndex: s.quotes.length - 1 };
      s.previewTurn = s.userTurns;
      s.contact.email = to;
      if (nm) s.contact.name = nm;
      return `PREVIEW (not sent). To: ${to}\nSubject: Ориентировъчна оферта – AluPlast Demo\n\n${body}\n\nNow tell the customer the offer is ready, repeat the address and ask for an explicit confirmation. Do NOT call send_offer_email in this turn.`;
    }
    case "send_offer_email": {
      const p = s.pendingEmail;
      if (!p) throw new ToolError("nothing to send: call preview_offer_email first");
      if (s.userTurns <= s.previewTurn) throw new ToolError("the customer has not answered the preview yet: ask for confirmation and wait");
      if (!AFFIRMATIVE.test(s.lastUserText)) throw new ToolError("the customer's last message is not a clear confirmation: ask again, do not send");
      if (p.quoteIndex !== s.quotes.length - 1) throw new ToolError("the offer changed after the preview: call preview_offer_email again");
      s.emailsSent.push({ to: p.to, at: now(), subject: "Ориентировъчна оферта – AluPlast Demo", body: p.body });
      s.pendingEmail = null;
      return `SENT to ${p.to}. Tell the customer it was sent and offer a call or consultation if not booked yet.`;
    }
    case "available_slots": {
      const k = a.kind;
      if (k !== "call" && k !== "consultation") throw new ToolError("kind must be 'call' or 'consultation'");
      const slots = freeSlots(k, await env.takenSlots(k), s.today);
      return JSON.stringify({ kind: k, slots, instructions: "Offer 2-3 of these slots in Bulgarian date format (e.g. сряда, 03.12, 14:00)." });
    }
    case "book_appointment": {
      const k = a.kind, slot = String(a.slot ?? "").trim(), nm = String(a.name ?? "").trim();
      const phone = cleanPhone(a.phone), address = String(a.address ?? "").trim();
      const p: string[] = [];
      if (k !== "call" && k !== "consultation") p.push("kind must be 'call' or 'consultation'");
      if (!nm) p.push("customer name is missing");
      if (!PHONE_RE.test(phone)) p.push(`phone '${a.phone ?? ""}' is not a valid Bulgarian number (+359... or 0...)`);
      if (k === "consultation" && address.length < 8) p.push("a consultation needs the full address (city, street, number)");
      if ((k === "call" || k === "consultation") && !freeSlots(k, await env.takenSlots(k), s.today, 10, 200).includes(slot))
        p.push(`slot '${slot}' is not available: call available_slots and offer one of those`);
      if (p.length) throw new ToolError(p.join("; "));
      const appt: Appointment = { kind: k as Appointment["kind"], slot, name: nm, phone, address };
      if (!(await env.bookSlot(appt))) throw new ToolError("slot was just taken: call available_slots again");
      s.appointments.push(appt);
      Object.assign(s.contact, { name: nm, phone }, address ? { address } : {});
      return `BOOKED ${k} on ${slot}. Confirm date, time and (for a consultation) the address to the customer.`;
    }
    case "save_contact": {
      if (a.email && !EMAIL_RE.test(String(a.email).trim())) throw new ToolError("invalid e-mail address");
      if (a.phone && !PHONE_RE.test(cleanPhone(a.phone))) throw new ToolError("invalid Bulgarian phone number");
      for (const f of ["name", "phone", "email"]) if (a[f]) s.contact[f] = String(a[f]).trim();
      return "saved";
    }
    case "handoff_to_human": {
      const t = { id: `T-${env.chatId}-${s.handoffs.length + 1}`, reason: String(a.reason ?? ""), summary: String(a.summary ?? ""), at: now() };
      s.handoffs.push(t);
      return `Ticket ${t.id} created. Tell the customer a colleague will contact them on the next working day (Mon–Fri 09:00–18:00) and give the phone +359 2 012 3456. If you do not have their phone or e-mail yet, ask for one.`;
    }
    default:
      throw new ToolError(`unknown tool '${name}'`);
  }
}
