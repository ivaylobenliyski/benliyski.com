/**
 * One customer turn: Claude tool loop + policy checker (port of uni_agent ChatSession).
 * History is append-only (required for preserved thinking): a blocked draft stays in the history, followed by a
 * checker note, and the model writes a corrected reply. The customer only ever sees replies that passed.
 */
import Anthropic from "@anthropic-ai/sdk";
import { checkReply } from "./checker";
import { FALLBACK, SYSTEM_PROMPT } from "./generated";
import type { HansState } from "./state";
import { runTool, ToolError, TOOLS, type ToolEnv } from "./tools";

export const MODEL = process.env.HANS_MODEL || "claude-opus-5-5";
const MAX_TOOL_TURNS = 8;
const MAX_REWRITES = 2;

export type Usage = { input: number; output: number; cache_read: number; cache_write: number; requests: number };
export const emptyUsage = (): Usage => ({ input: 0, output: 0, cache_read: 0, cache_write: 0, requests: 0 });
export type TurnLog = { tool_calls: { tool: string; input: unknown; error: boolean; output: string }[]; checks: { reply: string; problems: string[] }[] };

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic());
/** Test hook: replace the Anthropic client (see selftest.ts). */
export const setClientForTests = (c: unknown) => { client = c as Anthropic; };

async function untilText(messages: Anthropic.Beta.BetaMessageParam[], s: HansState, env: ToolEnv, usage: Usage, log: TurnLog): Promise<string> {
  for (let i = 0; i <= MAX_TOOL_TURNS; i++) {
    const last = i === MAX_TOOL_TURNS;
    if (last) messages.push({ role: "user", content: "[system] Tool budget exhausted; reply to the customer now without tools." });
    const r = await anthropic().beta.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages,
      tools: last ? undefined : TOOLS,
      output_config: { effort: "low" }, // short chat replies; raise if quality needs it
      cache_control: { type: "ephemeral" }, // caches the long system prompt + history prefix
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default", // on a policy decline the API retries on a fallback model in the same call
    });
    usage.requests++;
    usage.input += r.usage.input_tokens ?? 0;
    usage.output += r.usage.output_tokens ?? 0;
    usage.cache_read += r.usage.cache_read_input_tokens ?? 0;
    usage.cache_write += r.usage.cache_creation_input_tokens ?? 0;
    messages.push({ role: "assistant", content: r.content });
    if (r.stop_reason === "refusal") return FALLBACK;
    const calls = r.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (!calls.length) {
      return r.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text).join("").trim() || FALLBACK;
    }
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const c of calls) {
      let out: string, isError = false;
      try {
        out = await runTool(c.name, (c.input ?? {}) as Record<string, unknown>, s, env);
      } catch (e) {
        isError = true;
        out = e instanceof ToolError ? `Error: ${e.message}` : `Error: ${(e as Error).name}: ${(e as Error).message}`;
      }
      log.tool_calls.push({ tool: c.name, input: c.input, error: isError, output: out.slice(0, 500) });
      results.push({ type: "tool_result", tool_use_id: c.id, content: out, is_error: isError });
    }
    messages.push({ role: "user", content: results }); // all results in one message
  }
  return FALLBACK;
}

export async function hansTurn(messages: Anthropic.Beta.BetaMessageParam[], s: HansState, userText: string, env: ToolEnv, usage: Usage) {
  const log: TurnLog = { tool_calls: [], checks: [] };
  s.userTurns++;
  s.lastUserText = userText;
  messages.push({ role: "user", content: userText });
  let reply = await untilText(messages, s, env, usage, log);
  for (let attempt = 0; attempt <= MAX_REWRITES; attempt++) {
    const problems = reply === FALLBACK ? [] : checkReply(reply, { quotes: s.quotes, emailsSent: s.emailsSent, appointments: s.appointments });
    log.checks.push({ reply, problems });
    if (!problems.length) break;
    if (attempt === MAX_REWRITES) {
      reply = FALLBACK;
      await runTool("handoff_to_human", { reason: "policy checker blocked replies", summary: problems.join("; ") }, s, env);
      break;
    }
    messages.push({ role: "user", content: `[policy checker – not from the customer] Your last reply was blocked and NOT shown to the customer: ${problems.join("; ")}. Write a corrected reply (use tools if needed).` });
    reply = await untilText(messages, s, env, usage, log);
  }
  return { reply, log };
}
