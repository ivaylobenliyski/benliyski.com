/**
 * Self-test for the TypeScript port (no test framework needed):  npx tsx lib/hans/selftest.ts
 * 1) price engine reproduces the Python reference quotes in generated.ts exactly
 * 2) policy checker and e-mail consent gate behave like the Python tests
 */
import assert from "node:assert/strict";
import { emptyUsage, hansTurn, setClientForTests } from "./agent";
import { checkReply, parseNumber } from "./checker";
import { FALLBACK } from "./generated";
import { PARITY, PARITY_TODAY } from "./generated";
import { quote, QuoteError, type WindowRequest } from "./pricing";
import { freeSlots } from "./slots";
import { newState } from "./state";
import { runTool, ToolError, type ToolEnv } from "./tools";

let n = 0;
const ok = (name: string, fn: () => void | Promise<void>) => Promise.resolve(fn()).then(() => { n++; console.log("ok -", name); });

(async () => {
  for (const [i, c] of PARITY.entries()) {
    await ok(`parity case ${i + 1}`, () => {
      const run = () => quote(c.items as WindowRequest[], { competitorOffer: c.competitor_offer, today: PARITY_TODAY });
      if ("error" in c) {
        assert.throws(run, (e: unknown) => e instanceof QuoteError && e.needsHuman === c.needs_human);
      } else {
        assert.deepEqual(run(), c.quote);
      }
    });
  }
  await ok("parse numbers", () => {
    for (const [s, v] of [["1 098", 1098], ["1 098,50", 1098.5], ["1,098", 1098], ["955.08", 955.08], ["1.098", 1098], ["4 602,75", 4602.75]] as const)
      assert.equal(parseNumber(s), v);
  });
  const env: ToolEnv = { chatId: "t", takenSlots: async () => new Set(), bookSlot: async () => true };
  const s = newState(PARITY_TODAY);
  const item = { window_type: "tilt_turn", glass: "triple", width_cm: 120, height_cm: 140, quantity: 3, remove_old: true };
  await ok("quote tool display", async () => {
    const out = JSON.parse(await runTool("quote_price", { items: [item] }, s, env));
    assert.equal(out.display.range, "812 – 1 098 €");
  });
  const st = () => ({ quotes: s.quotes, emailsSent: s.emailsSent, appointments: s.appointments });
  await ok("checker accepts engine numbers", () => {
    assert.deepEqual(checkReply("Ориентировъчната цена е 812 – 1 098 € с ДДС и монтаж.", st()), []);
    assert.deepEqual(checkReply("The price is €812–1,098 incl. VAT.", st()), []);
    assert.deepEqual(checkReply("Тройният стъклопакет е +40 €/м².", st()), []);
    assert.deepEqual(checkReply("Отстъпката е 5%, а диапазонът ±15%.", st()), []);
    assert.deepEqual(checkReply("Колега ще Ви се обади до 2 работни дни.", st()), []);
  });
  await ok("checker blocks violations", () => {
    for (const bad of ["Струва около 900 €.", "Мога да Ви дам 10% отстъпка.", "Доставката е след 2 седмици.",
      "Монтажът може да е до 10 дни.", "Изпратих офертата на имейла Ви.", "Запазих Ви час за сряда.", Array(130).fill("дума").join(" ")])
      assert.ok(checkReply(bad, st()).length, bad);
  });
  await ok("e-mail consent gate", async () => {
    s.userTurns = 1; s.lastUserText = "ivan@example.com";
    await runTool("preview_offer_email", { email: "ivan@example.com" }, s, env);
    await assert.rejects(runTool("send_offer_email", {}, s, env), (e: unknown) => e instanceof ToolError && /not answered/.test((e as Error).message));
    s.userTurns = 2; s.lastUserText = "хм, колко беше?";
    await assert.rejects(runTool("send_offer_email", {}, s, env), /not a clear confirmation/);
    s.userTurns = 3; s.lastUserText = "Да, изпратете я";
    assert.match(await runTool("send_offer_email", {}, s, env), /^SENT/);
  });
  await ok("slots skip Sundays (Europe/Sofia dates)", () => {
    const slots = freeSlots("consultation", new Set(), "2026-11-30");
    assert.equal(slots[0], "2026-12-01 10:00");
    assert.ok(!slots.some((x) => x.startsWith("2026-12-06")));
  });
  await ok("booking validation", async () => {
    await assert.rejects(runTool("book_appointment", { kind: "consultation", slot: "2026-12-01 03:00", name: "", phone: "123" }, s, env),
      (e: unknown) => ["name", "phone", "address", "not available"].every((w) => (e as Error).message.includes(w)));
    assert.match(await runTool("book_appointment", { kind: "consultation", slot: "2026-12-01 10:00", name: "Иван", phone: "0888 123 456", address: "София, ул. Шипка 5" }, s, env), /^BOOKED/);
  });
  await ok("agent loop: invented price is blocked, tool used, history append-only", async () => {
    const replies: object[] = [
      { stop_reason: "end_turn", content: [{ type: "text", text: "Струва около 900 €." }] },
      { stop_reason: "tool_use", content: [{ type: "tool_use", id: "tu1", name: "quote_price", input: { items: [item] } }] },
      { stop_reason: "end_turn", content: [{ type: "text", text: "Ориентировъчната цена е 812 – 1 098 € с ДДС и монтаж." }] },
    ];
    const seen: unknown[] = [];
    setClientForTests({ beta: { messages: { create: async (p: unknown) => { seen.push(structuredClone(p)); return { ...replies.shift(), usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 3, cache_creation_input_tokens: 0 } }; } } } });
    const st2 = newState(PARITY_TODAY), msgs: never[] = [], usage = emptyUsage();
    const { reply, log } = await hansTurn(msgs, st2, "3 прозореца 120x140", env, usage);
    assert.equal(reply, "Ориентировъчната цена е 812 – 1 098 € с ДДС и монтаж.");
    assert.equal(log.checks[0].problems.length, 1);
    assert.equal(usage.requests, 3);
    const roles = (msgs as { role: string }[]).map((m) => m.role);
    assert.deepEqual(roles, ["user", "assistant", "user", "assistant", "user", "assistant"]); // draft + checker note kept
    const req = seen[0] as { model: string; output_config: unknown; betas: string[]; fallbacks: string };
    assert.equal(req.model, "claude-opus-5-5");
    assert.deepEqual(req.betas, ["server-side-fallback-2026-07-01"]);
  });
  await ok("agent loop: 3 blocked replies -> fallback + hand-off", async () => {
    setClientForTests({ beta: { messages: { create: async () => ({ stop_reason: "end_turn", content: [{ type: "text", text: "Давам Ви 10%." }], usage: {} }) } } });
    const st3 = newState(PARITY_TODAY);
    const { reply } = await hansTurn([], st3, "отстъпка?", env, emptyUsage());
    assert.equal(reply, FALLBACK);
    assert.equal(st3.handoffs[0].reason, "policy checker blocked replies");
  });
  console.log(`\n${n} checks passed`);
})().catch((e) => { console.error(e); process.exit(1); });
