import Link from "next/link";
import Logo from "./Logo";
import { LinkedInIcon, MailIcon, TelegramIcon } from "./Icons";
import { EMAIL, LINKEDIN, NAV_LINKS, TELEGRAM_DAILY, TELEGRAM_WEEKLY } from "@/lib/links";

const heading = "font-tech text-xs uppercase tracking-[0.18em] text-fg/50 mb-4";
const link = "inline-flex items-center gap-2 font-tech text-sm text-fg/75 hover:text-fg transition-colors py-1";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid gap-10 grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3">
            <Logo size={34} />
            <span className="font-tech font-semibold text-fg">benliyski</span>
          </Link>
          <p className="font-casual italic text-fg/60 mt-4 max-w-xs leading-relaxed">
            Building at the intersection of AI and curiosity.
          </p>
        </div>

        <div>
          <p className={heading}>Explore</p>
          <ul className="flex flex-col">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}><Link href={href} className={link}>{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className={heading}>Subscribe</p>
          <ul className="flex flex-col">
            <li><a href={TELEGRAM_DAILY} target="_blank" rel="noopener noreferrer" className={link}><TelegramIcon size={14} /> Daily digest</a></li>
            <li><a href={TELEGRAM_WEEKLY} target="_blank" rel="noopener noreferrer" className={link}><TelegramIcon size={14} /> Weekly digest</a></li>
          </ul>
        </div>

        <div>
          <p className={heading}>Contact</p>
          <ul className="flex flex-col">
            <li><a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className={link}><LinkedInIcon size={14} /> LinkedIn</a></li>
            <li><a href={`mailto:${EMAIL}`} className={link}><MailIcon size={14} /> Email</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="max-w-6xl mx-auto px-5 sm:px-8 py-6 font-tech text-xs text-fg/45">
          © {new Date().getFullYear()} Ivaylo Benliyski · Sofia, Bulgaria
        </p>
      </div>
    </footer>
  );
}
