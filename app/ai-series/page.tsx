import { supabase, type Post } from "@/lib/supabase";

export const metadata = {
  title: "AI Series — Ivaylo Benliyski",
  description: "An educational series on AI — how it works, where it's going, and what it means.",
};

export const revalidate = 60;

async function getPosts(): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return data ?? [];
}

export default async function AISeries() {
  const posts = await getPosts();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="mb-14">
        <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 uppercase tracking-widest mb-3">
          Educational Series
        </p>
        <h1 className="font-[family-name:var(--font-space-grotesk)] text-4xl font-bold text-[#F3E9D7] mb-4">
          AI in Plain Sight
        </h1>
        <p className="font-[family-name:var(--font-lora)] text-lg text-[#F3E9D7]/60 italic max-w-xl leading-relaxed">
          Breaking down how AI actually works — no hype, no jargon walls. Written for curious people, not just engineers.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="border border-dashed border-[#F3E9D7]/20 rounded-2xl p-12 text-center">
          <p className="font-[family-name:var(--font-lora)] text-[#F3E9D7]/40 italic">
            First posts coming soon.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <a
                href={`/ai-series/${post.slug}`}
                className="group block bg-[#1e3d35] border border-[#F3E9D7]/10 rounded-2xl p-6 hover:border-[#F3E9D7]/30 transition-colors"
              >
                {post.published_at && (
                  <p className="font-[family-name:var(--font-space-grotesk)] text-xs text-[#F3E9D7]/40 mb-2">
                    {new Date(post.published_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                )}
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-[#F3E9D7] mb-1 group-hover:text-white transition-colors">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="font-[family-name:var(--font-lora)] text-sm text-[#F3E9D7]/60 leading-relaxed">
                    {post.description}
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
