import { supabase, type Post } from "@/lib/supabase";

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
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-14">
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 uppercase tracking-widest mb-3">
          AI Vocabulary
        </p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-[#F3E9D7] mb-4">
          The Jargon, Decoded
        </h1>
        <p className="font-[family-name:var(--font-lora)] text-lg text-[#F3E9D7]/60 italic max-w-xl leading-relaxed">
          AI moves fast and speaks in acronyms. These are the terms worth actually understanding — explained without the fluff.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="border border-dashed border-[#F3E9D7]/20 rounded-2xl p-12 text-center">
          <p className="font-[family-name:var(--font-lora)] text-[#F3E9D7]/40 italic">
            First entries coming soon.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {entries.map((entry) => (
            <li key={entry.slug}>
              <a
                href={`/vocabulary/${entry.slug}`}
                className="group block bg-[#1e3d35] border border-[#F3E9D7]/10 rounded-2xl p-6 hover:border-[#F3E9D7]/30 transition-colors"
              >
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-[#F3E9D7] mb-1 group-hover:text-white transition-colors">
                  {entry.title}
                </h2>
                {entry.description && (
                  <p className="font-[family-name:var(--font-lora)] text-sm text-[#F3E9D7]/60 leading-relaxed">
                    {entry.description}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
