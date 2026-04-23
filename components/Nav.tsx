"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/ai-series", label: "AI Series" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#F3E9D7]/10 px-6 py-4 relative z-50">
      <nav className="max-w-4xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" onClick={() => setOpen(false)}>
          <Logo size={32} />
          <span className="font-[family-name:var(--font-space-grotesk)] font-semibold tracking-tight text-[#F3E9D7]">
            benliyski
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`font-[family-name:var(--font-space-grotesk)] text-sm transition-colors ${
                  pathname === href
                    ? "text-[#F3E9D7]"
                    : "text-[#F3E9D7]/50 hover:text-[#F3E9D7]"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Hamburger button */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className={`block w-5 h-px bg-[#F3E9D7] transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-px bg-[#F3E9D7] transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-px bg-[#F3E9D7] transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-[#16302B] border-b border-[#F3E9D7]/10 transition-all duration-300 overflow-hidden ${open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
        <ul className="max-w-4xl mx-auto px-6 py-4 flex flex-col gap-1">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`block font-[family-name:var(--font-space-grotesk)] text-sm py-3 border-b border-[#F3E9D7]/5 transition-colors ${
                  pathname === href
                    ? "text-[#F3E9D7]"
                    : "text-[#F3E9D7]/50 hover:text-[#F3E9D7]"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
