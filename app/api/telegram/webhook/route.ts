/**
 * Telegram Bot Webhook — /api/telegram/webhook
 *
 * Handles incoming messages from @ivo96_bot and routes commands:
 *   publish 1,3,7   → triggers "Publish Weekly Picks" GitHub Actions workflow
 *   /publish 1,3,7  → same (slash-command style)
 *   status          → shows last 5 workflow run statuses
 *   help / /help    → lists available commands
 */

import { NextRequest, NextResponse } from 'next/server';

const GITHUB_REPO = 'ivaylobenliyski/ai-digest';

export async function POST(req: NextRequest) {
  const BOT_TOKEN      = process.env.TELEGRAM_BOT_TOKEN!;
  const ALLOWED_CHAT   = process.env.TELEGRAM_CHAT_ID!;
  const GITHUB_TOKEN   = process.env.GITHUB_TOKEN!;
  const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

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

  // ── Command router ────────────────────────────────────────────────────────
  const lower = text.toLowerCase();

  // publish 1,3,7  |  /publish 1,3,7  |  publish 1 3 7
  const publishMatch = text.match(/^\/?\bpublish\b\s+([\d][\d\s,]*)$/i);
  if (publishMatch) {
    const numbers = publishMatch[1]
      .trim()
      .replace(/\s+/g, ',')
      .replace(/,+/g, ',')
      .replace(/,$/, '');

    const ok = await triggerPublish(GITHUB_TOKEN, numbers);
    const reply = ok
      ? `✅ Publishing stories <b>${numbers}</b> to your weekly channel...\n\nCheck your channel in ~30 seconds.`
      : `❌ Failed to trigger publish — check GitHub Actions for details.`;

    await sendMessage(BOT_TOKEN, chatId, reply);
    return new NextResponse('ok');
  }

  // status / /status
  if (lower === 'status' || lower === '/status') {
    const info = await getLatestRunStatus(GITHUB_TOKEN);
    await sendMessage(BOT_TOKEN, chatId, info);
    return new NextResponse('ok');
  }

  // help / /help / /start
  if (lower === 'help' || lower === '/help' || lower === '/start') {
    await sendMessage(
      BOT_TOKEN,
      chatId,
      '🤖 <b>@ivo96_bot commands</b>\n\n' +
      '<code>publish 1,3,7</code>\n└ Post selected stories to your weekly channel\n\n' +
      '<code>status</code>\n└ Show the last 5 workflow run results\n\n' +
      '<code>help</code>\n└ Show this message',
    );
    return new NextResponse('ok');
  }

  // Unknown input
  await sendMessage(
    BOT_TOKEN,
    chatId,
    `🤔 Unknown command. Try <code>help</code> to see what I can do.`,
  );

  return new NextResponse('ok');
}

export async function GET() {
  return new NextResponse('AI Digest Bot — Webhook active ✅');
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
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  if (!res.ok) return '❌ Could not fetch run status.';

  const { workflow_runs: runs } = await res.json() as { workflow_runs: WorkflowRun[] };
  if (!runs?.length) return 'No runs found.';

  const lines = runs.slice(0, 5).map(r => {
    const icon = r.conclusion === 'success' ? '✅'
               : r.conclusion === 'failure' ? '❌'
               : r.status === 'in_progress' ? '🔄'
               : '⏸️';
    return `${icon} ${r.name} — ${r.created_at.slice(0, 10)}`;
  });

  return `<b>Recent runs:</b>\n\n${lines.join('\n')}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
  };
}

interface WorkflowRun {
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
}
