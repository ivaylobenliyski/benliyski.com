import Logo from "./Logo";
import { TelegramIcon } from "./Icons";
import { TELEGRAM_DAILY } from "@/lib/links";

/** Shown while a section has no content yet — points people at the digest instead of a dead end. */
export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-card p-8 md:p-12">
      <Logo size={220} className="absolute -right-12 -bottom-12 opacity-[0.06] pointer-events-none" />
      <p className="font-tech text-xs text-sage uppercase tracking-[0.18em] mb-3">In the works</p>
      <p className="font-casual text-xl md:text-2xl text-fg leading-snug max-w-lg mb-3">{message}</p>
      <p className="font-casual text-fg/65 max-w-lg leading-relaxed mb-7">
        In the meantime, the daily AI digest lands on Telegram every morning at 09:00 Sofia time.
      </p>
      <a
        href={TELEGRAM_DAILY}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-tech text-sm font-semibold bg-fg text-bg px-5 py-3 rounded-full hover:bg-white transition-colors"
      >
        <TelegramIcon size={15} /> Join the daily digest
      </a>
    </div>
  );
}
