import Link from "next/link";
import { supabase, type Post } from "@/lib/supabase";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export const metadata = {
  title: "AI Vocabulary — Ivaylo Benliyski",
  description: "Plain-language definitions of AI terms and concepts — no jargon walls.",
};

export const revalidate = 60;

async function getEntries(): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("category", "vocabulary")
    .order("title", { ascending: true });
  return data ?? [];
}

export default async function Vocabulary() {
  const entries = await getEntries();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 md:py-24">
      <PageHeader
        eyebrow="AI Vocabulary"
        title="The Jargon, Decoded"
        intro="AI moves fast and speaks in acronyms. These are the terms worth actually understanding — explained without the fluff."
      />

      {entries.length === 0 ? (
        <EmptyState message="The first batch of AI terms is being decoded." />
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/vocabulary/${entry.slug}`}
                className="group block h-full bg-card border border-line rounded-2xl p-6 hover:border-fg/40 transition-colors"
              >
                <span className="block font-tech text-lg font-semibold text-fg mb-2">{entry.title}</span>
                {entry.description && (
                  <span className="block font-casual text-sm text-fg/65 leading-relaxed">{entry.description}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
