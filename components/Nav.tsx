"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import { TelegramIcon } from "./Icons";
import { NAV_LINKS, TELEGRAM_DAILY, TELEGRAM_WEEKLY } from "@/lib/links";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on Escape (links close it themselves on click)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 hover:opacity-80 transition-opacity" aria-label="benliyski — home">
          <Logo size={30} />
          <span className="font-tech font-semibold tracking-tight text-fg">benliyski</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-7">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`font-tech text-sm transition-colors ${
                    isActive(href) ? "text-fg" : "text-fg/60 hover:text-fg"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/#digest"
            className="inline-flex items-center gap-2 font-tech text-sm font-semibold bg-fg text-bg px-4 py-2 rounded-full hover:bg-white transition-colors"
          >
            <TelegramIcon size={14} />
            Subscribe
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden -mr-2 flex flex-col justify-center items-center gap-1.5 w-11 h-11"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className={`block w-5 h-px bg-fg transition-all duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block w-5 h-px bg-fg transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-fg transition-all duration-300 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden absolute top-full inset-x-0 bg-bg border-b border-line transition-all duration-300 overflow-hidden ${
          open ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="px-5 pt-2 pb-4 flex flex-col">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`block font-tech text-lg py-3.5 border-b border-line transition-colors ${
                  isActive(href) ? "text-fg" : "text-fg/65"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-5 pb-6 grid grid-cols-2 gap-3">
          <a
            href={TELEGRAM_DAILY}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-tech text-sm font-semibold bg-fg text-bg py-3 rounded-full"
          >
            <TelegramIcon size={14} /> Daily digest
          </a>
          <a
            href={TELEGRAM_WEEKLY}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-tech text-sm font-semibold border border-fg/30 text-fg py-3 rounded-full"
          >
            <TelegramIcon size={14} /> Weekly digest
          </a>
        </div>
      </div>
    </header>
  );
}
