/**
 * Telegram Bot Webhook — /api/telegram/webhook
 *
 * Commands:
 *   publish 1,3,7   → triggers "Publish Weekly Picks" GitHub Actions workflow
 *   status          → shows last 5 workflow run statuses
 *   help            → lists available commands
 *
 * Everything else → Q&A with Claude:
 *   - paste an article link + question  → Claude opens and reads the article
 *   - reply to a digest/bot message     → that message is used as context
 *   - plain question                    → answered with the latest daily + weekly digests as context
 */

import Anthropic from '@anthropic-ai/sdk';
import { after, NextRequest, NextResponse } from 'next/server';

const GITHUB_REPO = 'ivaylobenliyski/ai-digest';
const RAW_BASE    = `https://raw.githubusercontent.com/${GITHUB_REPO}/main`;
const TG_LIMIT    = 4000;   // Telegram caps messages at 4096 chars

// Claude may take a while when it has to fetch and read an article
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const BOT_TOKEN       = process.env.TELEGRAM_BOT_TOKEN!;
  const ALLOWED_CHAT    = process.env.TELEGRAM_CHAT_ID!;
  const GITHUB_TOKEN    = process.env.GITHUB_TOKEN!;
  const WEBHOOK_SECRET  = process.env.TELEGRAM_WEBHOOK_SECRET;

  // ── Security: verify Telegram secret token ───────────────────────────────
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (provided !== WEBHOOK_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  // ── Parse update ──────────────────────────────────────────────────────────
  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return new NextResponse('Bad request', { status: 400 });
  }

  const msg = update?.message;
  if (!msg) return new NextResponse('ok');

  const chatId = String(msg.chat.id);
  const text   = (msg.text ?? msg.caption ?? '').trim();

  // ── Only respond to your private chat ────────────────────────────────────
  if (chatId !== ALLOWED_CHAT || !text) {
    return new NextResponse('ok');
  }

  const lower = text.toLowerCase();

  // ── publish 1,3,7 ─────────────────────────────────────────────────────────
  const publishMatch = text.match(/^\/?\bpublish\b\s+([\d][\d\s,]*)$/i);
  if (publishMatch) {
    const numbers = publishMatch[1].trim().replace(/\s+/g, ',').replace(/,+/g, ',').replace(/,$/, '');
    const ok = await triggerPublish(GITHUB_TOKEN, numbers);
    await sendMessage(BOT_TOKEN, chatId,
      ok
        ? `✅ Publishing stories <b>${numbers}</b> to your weekly channel...\n\nCheck your channel in ~30 seconds.`
        : `❌ Failed to trigger publish — check GitHub Actions for details.`,
      'HTML'
    );
    return new NextResponse('ok');
  }

  // ── status ────────────────────────────────────────────────────────────────
  if (lower === 'status' || lower === '/status') {
    await sendMessage(BOT_TOKEN, chatId, await getLatestRunStatus(GITHUB_TOKEN), 'HTML');
    return new NextResponse('ok');
  }

  // ── help ──────────────────────────────────────────────────────────────────
  if (lower === 'help' || lower === '/help' || lower === '/start') {
    await sendMessage(BOT_TOKEN, chatId,
      '🤖 <b>@ivo96_bot commands</b>\n\n' +
      '<code>publish 1,3,7</code>\n└ Post selected stories to your weekly channel\n\n' +
      '<code>status</code>\n└ Show the last 5 workflow run results\n\n' +
      '<code>help</code>\n└ Show this message\n\n' +
      '💬 <b>Ask about any article</b>\n' +
      '• Paste a link + your question — I\'ll read the article\n' +
      '• Reply to a digest message — I\'ll use it as context\n' +
      '• Or just ask — I know today\'s and this week\'s digest',
      'HTML'
    );
    return new NextResponse('ok');
  }

  // ── Q&A — runs after we've acked Telegram, so slow answers don't trigger retries
  after(() => answerQuestion(BOT_TOKEN, chatId, msg));
  return new NextResponse('ok');
}

export async function GET() {
  return new NextResponse('AI Digest Bot — Webhook active ✅');
}

// ── Q&A ───────────────────────────────────────────────────────────────────────

async function answerQuestion(botToken: string, chatId: string, msg: TelegramMessage) {
  const placeholderId = await sendMessage(botToken, chatId, '⏳ Reading...');
  let answer: string;
  try {
    const digestContext = await fetchDigestContext();
    answer = await askClaude(buildUserPrompt(msg), digestContext);
  } catch (err) {
    console.error('Q&A failed:', err);
    answer = '❌ Something went wrong while answering. Try again in a moment.';
  }

  const chunks = splitForTelegram(answer);
  if (placeholderId) {
    await editMessage(botToken, chatId, placeholderId, chunks.shift()!);
  }
  for (const chunk of chunks) await sendMessage(botToken, chatId, chunk);
}

/** The user's question, plus the message they replied to and any links Telegram hid behind text. */
function buildUserPrompt(msg: TelegramMessage): string {
  const parts: string[] = [];

  const reply = msg.reply_to_message;
  const replyText = reply ? (reply.text ?? reply.caption ?? '').trim() : '';
  if (replyText) {
    const replyLinks = hiddenLinks(reply!);
    parts.push(
      'I am replying to this earlier message:\n"""\n' + replyText + '\n"""' +
      (replyLinks.length ? `\nLinks in that message: ${replyLinks.join(' ')}` : '')
    );
  }

  const question = (msg.text ?? msg.caption ?? '').trim();
  const links = hiddenLinks(msg);
  parts.push(question + (links.length ? `\nLinks: ${links.join(' ')}` : ''));

  return parts.join('\n\n');
}

/** URLs attached as text_link entities don't appear in the message text itself. */
function hiddenLinks(m: TelegramMessage): string[] {
  const entities = [...(m.entities ?? []), ...(m.caption_entities ?? [])];
  return entities.filter(e => e.type === 'text_link' && e.url).map(e => e.url!);
}

async function fetchDigestContext(): Promise<string> {
  const [daily, weekly] = await Promise.all([
    fetchJson<DeliveryLogEntry[]>(`${RAW_BASE}/delivery_log.json`),
    fetchJson<WeeklyLogEntry[]>(`${RAW_BASE}/weekly_log.json`),
  ]);
  const sections: string[] = [];

  const lastDaily = daily?.at(-1);
  if (lastDaily) {
    const lines = lastDaily.stories.map(s =>
      `- [${s.category ?? ''}] ${s.title}${s.summary ? `\n  ${s.summary}` : ''}${s.url ? `\n  ${s.url}` : ''}`
    );
    sections.push(`LATEST DAILY DIGEST (${lastDaily.sent_at.slice(0, 10)}):\n${lines.join('\n')}`);
  }

  const lastWeekly = weekly?.at(-1);
  if (lastWeekly) {
    const lines = lastWeekly.stories.map(s =>
      `${s.num}. [${s.category ?? ''}] ${s.title}${s.summary ? `\n   ${s.summary}` : ''}${s.url ? `\n   ${s.url}` : ''}`
    );
    sections.push(`LATEST WEEKLY DIGEST (${lastWeekly.sent_at.slice(0, 10)}, numbered as the user sees them):\n${lines.join('\n')}`);
  }

  return sections.join('\n\n');
}

const anthropic = new Anthropic();   // reads ANTHROPIC_API_KEY

async function askClaude(userPrompt: string, digestContext: string): Promise<string> {
  const system =
    `You are the Q&A assistant behind @ivo96_bot, Ivaylo Benliyski's personal AI-news Telegram bot. ` +
    `Ivaylo asks about specific news stories and articles.\n\n` +
    `- When the question involves an article (a link he sent, a story in the digests below, or a link in a message he replied to), ` +
    `use web_fetch to open and read the actual article before answering, rather than relying on the one-line summary. ` +
    `If the page can't be fetched, use web_search to find coverage of the same story and say that you did.\n` +
    `- Weekly story numbers ("story 3", "#3") refer to the weekly digest numbering below.\n` +
    `- Answer directly and concisely, like a knowledgeable friend in a chat. ` +
    `Ground claims in the article; say so when something isn't in it.\n` +
    `- Output plain text only: no markdown (no **, #, or tables). Short paragraphs or simple "- " bullets are fine.\n\n` +
    (digestContext || 'No digest context is available right now.');

  const tools: Anthropic.Beta.BetaToolUnion[] = [
    { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: 3 },
    { type: 'web_search_20260209', name: 'web_search', max_uses: 3 },
  ];
  const messages: Anthropic.Beta.BetaMessageParam[] = [{ role: 'user', content: userPrompt }];

  let response = await anthropic.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system,
    tools,
    messages,
  });

  // Long server-tool turns can pause; resend the paused turn to let the server resume.
  for (let i = 0; response.stop_reason === 'pause_turn' && i < 3; i++) {
    messages.push({ role: 'assistant', content: response.content });
    response = await anthropic.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system,
      tools,
      messages,
    });
    messages.pop();
  }

  if (response.stop_reason === 'refusal') {
    return '⚠️ I can\'t help with that one.';
  }

  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim();
  return text || '❌ No answer was generated. Try rephrasing.';
}

function splitForTelegram(text: string): string[] {
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > TG_LIMIT) {
    let cut = rest.lastIndexOf('\n', TG_LIMIT);
    if (cut < TG_LIMIT / 2) cut = TG_LIMIT;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut).trimStart();
  }
  chunks.push(rest);
  return chunks;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    return res.ok ? await res.json() as T : null;
  } catch {
    return null;
  }
}

/** Sends a message; returns its message_id (null on failure). Omit parseMode for plain text. */
async function sendMessage(token: string, chatId: string, text: string, parseMode?: 'HTML'): Promise<number | null> {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode, disable_web_page_preview: true }),
  });
  const data = await res.json().catch(() => null) as { ok: boolean; result?: { message_id: number }; description?: string } | null;
  if (!data?.ok) console.error('sendMessage failed:', data?.description);
  return data?.result?.message_id ?? null;
}

async function editMessage(token: string, chatId: string, messageId: number, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) {
    console.error('editMessageText failed:', await res.text());
    await sendMessage(token, chatId, text);
  }
}

async function triggerPublish(githubToken: string, storyNumbers: string) {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/publish_stories.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main', inputs: { story_numbers: storyNumbers } }),
    }
  );
  return res.ok;
}

async function getLatestRunStatus(githubToken: string): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=5`,
    { headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json' } }
  );
  if (!res.ok) return '❌ Could not fetch run status.';
  const { workflow_runs: runs } = await res.json() as { workflow_runs: WorkflowRun[] };
  if (!runs?.length) return 'No runs found.';
  const lines = runs.slice(0, 5).map(r => {
    const icon = r.conclusion === 'success' ? '✅' : r.conclusion === 'failure' ? '❌' : r.status === 'in_progress' ? '🔄' : '⏸️';
    return `${icon} ${r.name} — ${r.created_at.slice(0, 10)}`;
  });
  return `<b>Recent runs:</b>\n\n${lines.join('\n')}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface TelegramEntity {
  type: string;
  url?: string;
}

interface TelegramMessage {
  chat: { id: number };
  text?: string;
  caption?: string;
  entities?: TelegramEntity[];
  caption_entities?: TelegramEntity[];
  reply_to_message?: TelegramMessage;
}

interface TelegramUpdate {
  message?: TelegramMessage;
}

interface WorkflowRun {
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
}

interface DigestStory {
  title: string;
  summary?: string;
  url?: string;
  category?: string;
}

interface DeliveryLogEntry {
  sent_at: string;
  stories: DigestStory[];
}

interface WeeklyLogEntry {
  sent_at: string;
  stories: (DigestStory & { num: number })[];
}
