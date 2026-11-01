import type { Metadata, Viewport } from "next";
import { Lora, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Daily and weekly AI digests on Telegram, plus notes on AI trends, a jargon decoder, and side projects by Ivaylo Benliyski.";

export const metadata: Metadata = {
  metadataBase: new URL("https://benliyski.com"),
  title: "Ivaylo Benliyski — AI, without the noise",
  description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Ivaylo Benliyski — AI, without the noise",
    description,
    url: "https://benliyski.com",
    siteName: "benliyski.com",
    images: [{ url: "/logo-800.png", width: 800, height: 800 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#16302B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${spaceGrotesk.variable} h-full`}>
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-3GLEN3FTPV" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3GLEN3FTPV');
        `}</Script>
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
