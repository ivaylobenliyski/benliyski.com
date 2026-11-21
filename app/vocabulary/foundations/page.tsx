import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import TopicMap from "@/components/foundations/TopicMap";
import { FOUNDATIONS_PATH } from "@/lib/foundations";

export const metadata: Metadata = {
  title: "What is AI? A visual map of the foundations — Ivaylo Benliyski",
  description:
    "An interactive map of AI fundamentals: what AI is, its history, how machines learn, and the main kinds of models — language, vision and multimodal. Plain language, with sources.",
  alternates: { canonical: FOUNDATIONS_PATH },
  openGraph: {
    title: "What is AI? A visual map of the foundations",
    description: "Start here: an interactive, sourced map of AI fundamentals in plain language.",
    url: FOUNDATIONS_PATH,
    type: "website",
  },
};

export default function Foundations() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 font-tech text-sm text-fg/50">
          <li>
            <Link href="/vocabulary" className="hover:text-fg transition-colors">Vocabulary</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-fg" aria-current="page">Foundations</li>
        </ol>
      </nav>

      <PageHeader
        eyebrow="Foundations"
        title="What is AI? Start here."
        intro="A map of the ideas underneath everything else. Follow the lines from the big picture to the details, or jump straight to whatever you are curious about."
      />

      <TopicMap />

      <p className="mt-10 font-casual text-sm text-fg/50 max-w-2xl leading-relaxed">
        Every guide cites its sources — original papers wherever possible — and is re-checked before it&apos;s
        updated. New topics get added to the map as they&apos;re written.
      </p>
    </div>
  );
}
