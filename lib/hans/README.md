# Hans – AI offer assistant demo (university project)

Live prototype of **Hans**, the AI offer assistant of **AluPlast Demo**, a *fictional* PVC-window company
(university case study). Source of truth, docs and evals: `ivaylobenliyski/University` →
`projects/aluplast_demo/`.

**URL:** `https://benliyski.com/hans` – behind the browser's login prompt (HTTP Basic Auth, `proxy.ts`), with the
user name and password from `HANS_USER` / `HANS_PASSWORD`. If either is unset, nobody gets in. The pages are
`noindex`, send no Referer, are not in the sitemap or nav, and Google Analytics is switched off on them.
Sales-team view: `/hans/team` (leads, appointments, e-mailed offers, hand-offs, feedback, token cost).

## Setup (once)
1. **Supabase:** run `supabase/hans_demo.sql` in the SQL editor (3 tables, RLS on, no public policies).
2. **Vercel environment variables** (Production + Preview):
   | Variable | Value |
   |---|---|
   | `HANS_USER` / `HANS_PASSWORD` | the login for `/hans` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project settings → API → service_role key (server-only, never `NEXT_PUBLIC_`) |
   | `ANTHROPIC_API_KEY` | already set for the Telegram bot |
   | `HANS_MODEL` *(optional)* | default `claude-opus-5-5` |
   | `HANS_DAILY_CHATS` *(optional)* | max new conversations per 24 h, default 100 |
3. Redeploy, open `/hans`.

## How it works
- `generated.ts` – price list, rules, Hans's system prompt + knowledge base, fixed texts and parity cases,
  **generated** from the University repo: `python projects/aluplast_demo/export_web.py <path>/lib/hans/generated.ts`.
- `pricing.ts` – deterministic price engine (integer cents); must match the Python reference exactly.
- `tools.ts` – quote, e-mail preview/send (consent gate), slots, booking, contact, hand-off.
- `checker.ts` – policy checker run on every reply (prices only from the engine, max 5%, ≥3 weeks delivery,
  no false "sent/booked" claims, short replies). Blocked drafts are rewritten; after 3 failures → hand-off.
- `agent.ts` – Claude tool loop (Opus 5.5, effort `low`, prompt caching, server-side refusal fallback).
  History is append-only.
- Offer e-mails are **not really sent** – they appear in the team view (demo outbox).

## Test
```bash
npx tsx lib/hans/selftest.ts   # parity with the Python engine + checker, consent gate, agent loop (no API calls)
```
