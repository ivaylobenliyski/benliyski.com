/**
 * Telegram Bot Webhook — /api/telegram/webhook
 *
 * Commands:
 *   publish 1,3,7   → triggers "Publish Weekly Picks" GitHub Actions workflow
 *   status          → shows last 5 workflow run statuses
 *   help            → lists available commands
 *
 * Everything else → forwarded to Claude with latest story context as Q&A
 */

import { NextRequest, NextResponse } from 'next/server';

const GITHUB_REPO = 'ivaylobenliyski/ai-digest';

export async function POST(req: NextRequest) {
  const BOT_TOKEN       = process.env.TELEGRAM_BOT_TOKEN!;
  const ALLOWED_CHAT    = process.env.TELEGRAM_CHAT_ID!;
  const GITHUB_TOKEN    = process.env.GITHUB_TOKEN!;
  const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY!;
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
  const text   = (msg.text ?? '').trim();

  // ── Only respond to your private chat ────────────────────────────────────
  if (chatId !== ALLOWED_CHAT) {
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
        : `❌ Failed to trigger publish — check GitHub Actions for details.`
    );
    return new NextResponse('ok');
  }

  // ── status ────────────────────────────────────────────────────────────────
  if (lower === 'status' || lower === '/status') {
    await sendMessage(BOT_TOKEN, chatId, await getLatestRunStatus(GITHUB_TOKEN));
    return new NextResponse('ok');
  }

  // ── help ──────────────────────────────────────────────────────────────────
  if (lower === 'help' || lower === '/help' || lower === '/start') {
    await sendMessage(BOT_TOKEN, chatId,
      '🤖 <b>@ivo96_bot commands</b>\n\n' +
      '<code>publish 1,3,7</code>\n└ Post selected stories to your weekly channel\n\n' +
      '<code>status</code>\n└ Show the last 5 workflow run results\n\n' +
      '<code>help</code>\n└ Show this message\n\n' +
      '💬 <b>Or just ask anything</b> — questions about specific stories, summaries, context, analysis. I\'ll answer using the latest digest as context.'
    );
    return new NextResponse('ok');
  }

  // ── Q&A — forward anything else to Claude ────────────────────────────────
  await sendMessage(BOT_TOKEN, chatId, '⏳ Thinking...');

  const context = await fetchStoryContext();
  const answer  = await askClaude(ANTHROPIC_KEY, text, context);
  await sendMessage(BOT_TOKEN, chatId, answer);

  return new NextResponse('ok');
}

export async function GET() {
  return new NextResponse('AI Digest Bot — Webhook active ✅');
}

// ── Story context ─────────────────────────────────────────────────────────────

async function fetchStoryContext(): Promise<string> {
  try {
    // Weekly log for curated stories
    const weeklyRes = await fetch(
      'https://raw.githubusercontent.com/ivaylobenliyski/ai-digest/main/weekly_log.json',
      { next: { revalidate: 0 } }
    );
    if (weeklyRes.ok) {
      const log: WeeklyLog[] = await weeklyRes.json();
      const latest = log[log.length - 1];
      const lines = latest.stories.map(s =>
        `${s.num}. [${s.category ?? ''}] ${s.title}\n   ${s.summary ?? ''}\n   ${s.url ?? ''}`
      ).join('\n\n');
      return `Weekly digest from ${latest.sent_at.slice(0, 10)}:\n\n${lines}`;
    }
  } catch { /* fall through */ }
  return '';
}

// ── Claude Q&A ────────────────────────────────────────────────────────────────

async function askClaude(apiKey: string, question: string, context: string): Promise<string> {
  const system = context
    ? `You are an AI news assistant for Ivaylo Benliyski's personal digest bot (@ivo96_bot). ` +
      `Answer questions concisely and conversationally. Use the story context below when relevant, ` +
      `or your general knowledge for broader AI questions. Format for Telegram (plain text, no markdown symbols).\n\n` +
      `STORY CONTEXT:\n${context}`
    : `You are an AI news assistant. Answer questions about AI concisely and conversationally. ` +
      `Format for Telegram (plain text, no markdown symbols).`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system,
      messages: [{ role: 'user', content: question }],
    }),
  });

  if (!res.ok) return '❌ Could not reach Claude. Try again in a moment.';
  const data = await res.json() as AnthropicResponse;
  return data.content?.[0]?.text ?? '❌ No response generated.';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function sendMessage(token: string, chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
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

interface TelegramUpdate {
  message?: { chat: { id: number }; text?: string };
}

interface WorkflowRun {
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
}

interface WeeklyLog {
  sent_at: string;
  stories: { num: number; title: string; summary?: string; url?: string; category?: string }[];
}

interface AnthropicResponse {
  content?: { text: string }[];
}
