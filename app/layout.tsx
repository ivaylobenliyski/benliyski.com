import type { Metadata } from "next";
import { Lora, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ivaylo Benliyski",
  description: "AI series, side projects, and thoughts on technology.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Ivaylo Benliyski",
    description: "AI series, side projects, and thoughts on technology.",
    url: "https://benliyski.com",
    siteName: "benliyski.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#F3E9D7]/10 py-8 text-center text-[#F3E9D7]/40 text-sm font-[family-name:var(--font-lora)]">
          © {new Date().getFullYear()} Ivaylo Benliyski
        </footer>
      </body>
    </html>
  );
}
