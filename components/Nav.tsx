"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/ai-series", label: "AI Series" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-[#F3E9D7]/10 px-6 py-4">
      <nav className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo size={32} />
          <span className="font-[family-name:var(--font-space-grotesk)] font-semibold tracking-tight text-[#F3E9D7]">
            benliyski
          </span>
        </Link>

        <ul className="flex items-center gap-6">
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
      </nav>
    </header>
  );
}
